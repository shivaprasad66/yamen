import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTransaction } from '@/lib/solana'
import { txSignatureSchema } from '@/lib/validations'
import { IdeaStatus } from '@prisma/client'

// POST /api/ideas/:id/confirm-payment - Confirm payment and mark idea as OPEN
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { txSignature } = body

    if (!txSignature) {
      return NextResponse.json(
        { error: 'Transaction signature is required' },
        { status: 400 }
      )
    }

    // Validate signature format
    txSignatureSchema.parse(txSignature)

    // Verify transaction on-chain
    const isValid = await verifyTransaction(txSignature)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid transaction signature' },
        { status: 400 }
      )
    }

    // Update idea with escrow transaction signature
    const idea = await prisma.idea.update({
      where: { id: params.id },
      data: {
        escrowTxSignature: txSignature,
        status: IdeaStatus.OPEN,
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

    // Log activity
    await prisma.ideaActivityLog.create({
      data: {
        ideaId: idea.id,
        actorId: idea.founderId,
        type: 'PAYMENT_CONFIRMED',
        metadata: {
          txSignature,
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
    console.error('Error confirming payment:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}


