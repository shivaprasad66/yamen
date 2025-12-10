import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isIdeaFounder } from '@/lib/auth'
import { FeedbackStatus } from '@prisma/client'

// POST /api/feedback/:id/reject - Reject feedback
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
        { error: 'Only the founder can reject feedback' },
        { status: 403 }
      )
    }

    // Update feedback status
    const updatedFeedback = await prisma.feedback.update({
      where: { id: params.id },
      data: {
        status: FeedbackStatus.REJECTED,
      },
      include: {
        contributor: {
          select: {
            id: true,
            name: true,
            walletAddress: true,
          },
        },
      },
    })

    // Log activity
    await prisma.ideaActivityLog.create({
      data: {
        ideaId: feedback.ideaId,
        actorId: user.id,
        type: 'FEEDBACK_REJECTED',
        metadata: {
          feedbackId: feedback.id,
        },
      },
    })

    return NextResponse.json({ feedback: updatedFeedback })
  } catch (error) {
    console.error('Error rejecting feedback:', error)
    return NextResponse.json(
      { error: 'Failed to reject feedback' },
      { status: 500 }
    )
  }
}


