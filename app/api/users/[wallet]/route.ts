import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { walletAddressSchema } from '@/lib/validations'

// GET /api/users/:wallet - Get user profile
export async function GET(
  request: NextRequest,
  { params }: { params: { wallet: string } }
) {
  try {
    const walletAddress = walletAddressSchema.parse(params.wallet)

    const user = await prisma.user.findUnique({
      where: { walletAddress },
      include: {
        ideasPosted: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            _count: {
              select: {
                feedbacks: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        feedbacks: {
          include: {
            idea: {
              select: {
                id: true,
                title: true,
              },
            },
            payout: {
              select: {
                amount: true,
                currency: true,
                status: true,
                txSignature: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate stats
    const acceptedFeedbacks = user.feedbacks.filter(
      (f) => f.status === 'ACCEPTED'
    )
    const totalEarned = acceptedFeedbacks.reduce((sum, feedback) => {
      if (feedback.payout) {
        return sum + Number(feedback.payout.amount)
      }
      return sum
    }, 0)

    return NextResponse.json({
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      stats: {
        ideasPosted: user.ideasPosted.length,
        feedbacksGiven: user.feedbacks.length,
        feedbacksAccepted: acceptedFeedbacks.length,
        totalEarned,
      },
      ideasPosted: user.ideasPosted.map((idea) => ({
        ...idea,
        feedbackCount: idea._count.feedbacks,
      })),
      feedbacks: user.feedbacks.map((feedback) => ({
        ...feedback,
        payout: feedback.payout
          ? {
              ...feedback.payout,
              amount: Number(feedback.payout.amount),
            }
          : null,
      })),
    })
  } catch (error: any) {
    console.error('Error fetching user:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}


