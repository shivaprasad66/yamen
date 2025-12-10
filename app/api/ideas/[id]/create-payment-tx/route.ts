import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createFounderToTreasuryTx } from '@/lib/solana'

// POST /api/ideas/:id/create-payment-tx - Create payment transaction
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

    // Get idea
    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
      include: {
        founder: true,
      },
    })

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      )
    }

    // Verify wallet matches founder
    if (idea.founder.walletAddress !== walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address does not match idea founder' },
        { status: 403 }
      )
    }

    // Check if already paid
    if (idea.escrowTxSignature) {
      return NextResponse.json(
        { error: 'Payment already confirmed for this idea' },
        { status: 400 }
      )
    }

    // Create transaction
    const amount = Number(idea.totalBudget)
    const serializedTx = await createFounderToTreasuryTx(
      walletAddress,
      amount,
      idea.currency
    )

    return NextResponse.json({
      transaction: serializedTx,
      amount,
      currency: idea.currency,
    })
  } catch (error: any) {
    console.error('Error creating payment transaction:', error)
    return NextResponse.json(
      {
        error: 'Failed to create payment transaction',
        details: error.message,
      },
      { status: 500 }
    )
  }
}


