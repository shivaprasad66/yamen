import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createFeedbackSchema } from '@/lib/validations'
import { getOrCreateUser } from '@/lib/auth'
import { FeedbackStatus } from '@prisma/client'

// POST /api/ideas/:id/feedback - Submit feedback
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { walletAddress, name, body: feedbackBody, experienceTag } = body

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Validate feedback data
    const validatedData = createFeedbackSchema.parse({
      body: feedbackBody,
      experienceTag,
    })

    // Check if idea exists and is open
    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
    })

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      )
    }

    if (idea.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Idea is not accepting feedback' },
        { status: 400 }
      )
    }

    // Check if user already submitted feedback for this idea
    const user = await getOrCreateUser(walletAddress, name)
    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        ideaId: params.id,
        contributorId: user.id,
      },
    })

    if (existingFeedback) {
      return NextResponse.json(
        { error: 'You have already submitted feedback for this idea' },
        { status: 400 }
      )
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        ideaId: params.id,
        contributorId: user.id,
        body: validatedData.body,
        experienceTag: validatedData.experienceTag,
        status: FeedbackStatus.PENDING,
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
        ideaId: params.id,
        actorId: user.id,
        type: 'FEEDBACK_SUBMITTED',
        metadata: {
          feedbackId: feedback.id,
        },
      },
    })

    return NextResponse.json({ feedback })
  } catch (error: any) {
    console.error('Error creating feedback:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}


