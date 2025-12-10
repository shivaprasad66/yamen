import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTreasuryToContributorTx } from '@/lib/solana'
import { PayoutStatus } from '@prisma/client'

// POST /api/payouts/:id/send - Send payout from treasury
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get payout
    const payout = await prisma.payout.findUnique({
      where: { id: params.id },
      include: {
        contributor: true,
        idea: true,
      },
    })

    if (!payout) {
      return NextResponse.json(
        { error: 'Payout not found' },
        { status: 404 }
      )
    }

    if (payout.status !== PayoutStatus.PENDING) {
      return NextResponse.json(
        { error: `Payout is already ${payout.status}` },
        { status: 400 }
      )
    }

    // Send transaction from treasury
    const amount = Number(payout.amount)
    const txSignature = await sendTreasuryToContributorTx(
      payout.contributor.walletAddress,
      amount,
      payout.currency
    )

    // Update payout with transaction signature
    const updatedPayout = await prisma.payout.update({
      where: { id: params.id },
      data: {
        txSignature,
        status: PayoutStatus.SENT,
      },
    })

    // Log activity
    await prisma.ideaActivityLog.create({
      data: {
        ideaId: payout.ideaId,
        actorId: payout.contributorId, // System action, but we log the contributor
        type: 'PAYOUT_SENT',
        metadata: {
          payoutId: payout.id,
          txSignature,
          amount,
          currency: payout.currency,
        },
      },
    })

    return NextResponse.json({
      payout: {
        ...updatedPayout,
        amount: Number(updatedPayout.amount),
      },
    })
  } catch (error: any) {
    console.error('Error sending payout:', error)

    // Update payout status to FAILED
    try {
      await prisma.payout.update({
        where: { id: params.id },
        data: {
          status: PayoutStatus.FAILED,
        },
      })
    } catch (updateError) {
      console.error('Error updating payout status:', updateError)
    }

    return NextResponse.json(
      {
        error: 'Failed to send payout',
        details: error.message,
      },
      { status: 500 }
    )
  }
}


