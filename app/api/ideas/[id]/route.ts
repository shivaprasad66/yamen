import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/ideas/:id - Get idea details with feedback
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
      include: {
        founder: {
          select: {
            id: true,
            name: true,
            walletAddress: true,
          },
        },
        feedbacks: {
          include: {
            contributor: {
              select: {
                id: true,
                name: true,
                walletAddress: true,
              },
            },
            payout: {
              select: {
                id: true,
                txSignature: true,
                status: true,
                amount: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            feedbacks: true,
          },
        },
      },
    })

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      idea: {
        ...idea,
        totalBudget: Number(idea.totalBudget),
        rewardPerAcceptedFeedback: Number(idea.rewardPerAcceptedFeedback),
        feedbacks: idea.feedbacks.map((feedback) => ({
          ...feedback,
          payout: feedback.payout
            ? {
                ...feedback.payout,
                amount: Number(feedback.payout.amount),
              }
            : null,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching idea:', error)
    return NextResponse.json(
      { error: 'Failed to fetch idea' },
      { status: 500 }
    )
  }
}


