import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createIdeaSchema } from '@/lib/validations'
import { getOrCreateUser, updateUserRole } from '@/lib/auth'
import { UserRole, IdeaStatus } from '@prisma/client'

// GET /api/ideas - List all ideas
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as IdeaStatus | null

    const ideas = await prisma.idea.findMany({
      where: status ? { status } : undefined,
      include: {
        founder: {
          select: {
            id: true,
            name: true,
            walletAddress: true,
          },
        },
        _count: {
          select: {
            feedbacks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const ideasWithStats = ideas.map((idea) => ({
      id: idea.id,
      title: idea.title,
      description: idea.description,
      status: idea.status,
      currency: idea.currency,
      totalBudget: Number(idea.totalBudget),
      rewardPerAcceptedFeedback: Number(idea.rewardPerAcceptedFeedback),
      maxAcceptedFeedbacks: idea.maxAcceptedFeedbacks,
      acceptedCount: idea.acceptedCount,
      founder: idea.founder,
      feedbackCount: idea._count.feedbacks,
      createdAt: idea.createdAt,
      updatedAt: idea.updatedAt,
    }))

    return NextResponse.json({ ideas: ideasWithStats })
  } catch (error) {
    console.error('Error fetching ideas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ideas' },
      { status: 500 }
    )
  }
}

// POST /api/ideas - Create new idea
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, name } = body

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Validate idea data
    const validatedData = createIdeaSchema.parse(body)

    // Get or create user
    const user = await getOrCreateUser(walletAddress, name)

    // Update role if needed
    if (user.role === UserRole.CONTRIBUTOR) {
      await updateUserRole(user.id, UserRole.BOTH)
    } else if (user.role !== UserRole.BOTH && user.role !== UserRole.FOUNDER) {
      await updateUserRole(user.id, UserRole.FOUNDER)
    }

    // Calculate max accepted feedbacks
    const maxAcceptedFeedbacks = Math.floor(
      validatedData.totalBudget / validatedData.rewardPerAcceptedFeedback
    )

    // Create idea (status will be OPEN after payment confirmation)
    const idea = await prisma.idea.create({
      data: {
        founderId: user.id,
        title: validatedData.title,
        description: validatedData.description,
        context: validatedData.context,
        currency: validatedData.currency,
        totalBudget: validatedData.totalBudget,
        rewardPerAcceptedFeedback: validatedData.rewardPerAcceptedFeedback,
        maxAcceptedFeedbacks,
        status: IdeaStatus.OPEN, // Will be set after payment
      },
      include: {
        founder: {
          select: {
            id: true,
            name: true,
            walletAddress: true,
          },
        },
      },
    })

    return NextResponse.json({
      idea: {
        ...idea,
        totalBudget: Number(idea.totalBudget),
        rewardPerAcceptedFeedback: Number(idea.rewardPerAcceptedFeedback),
      },
    })
  } catch (error: any) {
    console.error('Error creating idea:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create idea' },
      { status: 500 }
    )
  }
}


