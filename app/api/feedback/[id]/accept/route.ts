import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isIdeaFounder } from '@/lib/auth'
import { FeedbackStatus, PayoutStatus } from '@prisma/client'

// POST /api/feedback/:id/accept - Accept feedback and create payout
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { walletAddress } = body

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Get feedback and idea
    const feedback = await prisma.feedback.findUnique({
      where: { id: params.id },
      include: {
        idea: true,
        contributor: true,
      },
    })

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { walletAddress },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is founder
    const isFounder = await isIdeaFounder(feedback.ideaId, user.id)
    if (!isFounder) {
      return NextResponse.json(
        { error: 'Only the founder can accept feedback' },
        { status: 403 }
      )
    }

    // Check if already accepted
    if (feedback.status === FeedbackStatus.ACCEPTED) {
      return NextResponse.json(
        { error: 'Feedback already accepted' },
        { status: 400 }
      )
    }

    // Check if idea has remaining budget
    if (feedback.idea.acceptedCount >= feedback.idea.maxAcceptedFeedbacks) {
      return NextResponse.json(
        { error: 'Idea has reached maximum accepted feedbacks' },
        { status: 400 }
      )
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update feedback status
      const updatedFeedback = await tx.feedback.update({
        where: { id: params.id },
        data: {
          status: FeedbackStatus.ACCEPTED,
        },
      })

      // Increment accepted count
      const updatedIdea = await tx.idea.update({
        where: { id: feedback.ideaId },
        data: {
          acceptedCount: {
            increment: 1,
          },
        },
      })

      // Create payout record
      const payout = await tx.payout.create({
        data: {
          feedbackId: params.id,
          ideaId: feedback.ideaId,
          contributorId: feedback.contributorId,
          amount: feedback.idea.rewardPerAcceptedFeedback,
          currency: feedback.idea.currency,
          status: PayoutStatus.PENDING,
        },
      })

      // Log activity
      await tx.ideaActivityLog.create({
        data: {
          ideaId: feedback.ideaId,
          actorId: user.id,
          type: 'FEEDBACK_ACCEPTED',
          metadata: {
            feedbackId: feedback.id,
            payoutId: payout.id,
          },
        },
      })

      return { feedback: updatedFeedback, idea: updatedIdea, payout }
    })

    return NextResponse.json({
      feedback: result.feedback,
      payout: {
        ...result.payout,
        amount: Number(result.payout.amount),
      },
    })
  } catch (error) {
    console.error('Error accepting feedback:', error)
    return NextResponse.json(
      { error: 'Failed to accept feedback' },
      { status: 500 }
    )
  }
}


