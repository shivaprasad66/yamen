'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@/components/WalletProvider'
import WalletButton from '@/components/WalletButton'

export default function CreateIdeaPage() {
  const router = useRouter()
  const { walletAddress, isConnected } = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    context: '',
    currency: 'SOL' as 'SOL' | 'USDC',
    totalBudget: 50,
    rewardPerAcceptedFeedback: 5,
  })

  const maxAcceptedFeedbacks = Math.floor(
    formData.totalBudget / formData.rewardPerAcceptedFeedback
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isConnected || !walletAddress) {
      setError('Please connect your wallet first (or use mock mode)')
      // For preview mode, allow without wallet
      if (process.env.NODE_ENV === 'development') {
        alert('Preview mode: Form submitted (no actual payment)')
        router.push('/ideas/preview')
        return
      }
      return
    }

    setIsSubmitting(true)

    try {
      // Step 1: Create idea
      const ideaResponse = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          walletAddress,
        }),
      })

      if (!ideaResponse.ok) {
        const errorData = await ideaResponse.json()
        throw new Error(errorData.error || 'Failed to create idea')
      }

      const { idea } = await ideaResponse.json()

      // Step 2: Create payment transaction
      const txResponse = await fetch(`/api/ideas/${idea.id}/create-payment-tx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      })

      if (!txResponse.ok) {
        const errorData = await txResponse.json()
        throw new Error(errorData.error || 'Failed to create payment transaction')
      }

      const { transaction, amount, currency } = await txResponse.json()

      // Step 3: Sign and send transaction
      const { Transaction, Connection } = await import('@solana/web3.js')
      
      // Get RPC URL
      let rpcUrl = 'https://api.devnet.solana.com'
      if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
        rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL
      } else if (process.env.NEXT_PUBLIC_HELIUS_API_KEY) {
        rpcUrl = `https://rpc.helius.xyz/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`
      }
      
      const connection = new Connection(rpcUrl, 'confirmed')

      const tx = Transaction.from(Buffer.from(transaction, 'base64'))
      
      if (!window.solana) {
        throw new Error('Wallet not connected')
      }

      const signed = await window.solana.signTransaction(tx)
      const signature = await connection.sendRawTransaction(signed.serialize())
      await connection.confirmTransaction(signature, 'confirmed')

      // Step 4: Confirm payment
      const confirmResponse = await fetch(`/api/ideas/${idea.id}/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txSignature: signature }),
      })

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json()
        throw new Error(errorData.error || 'Failed to confirm payment')
      }

      // Success - redirect to idea page
      router.push(`/ideas/${idea.id}`)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="text-2xl font-bold text-blue-600">
              VCTX Feedback Hub
            </a>
            <WalletButton />
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Post an Idea</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              required
              minLength={3}
              maxLength={200}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What's your idea?"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              required
              minLength={50}
              maxLength={5000}
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your idea in detail (minimum 50 characters)..."
            />
          </div>

          <div>
            <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Context (Optional)
            </label>
            <textarea
              id="context"
              maxLength={10000}
              rows={4}
              value={formData.context}
              onChange={(e) => setFormData({ ...formData, context: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any additional context, market research, or background..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                Currency *
              </label>
              <select
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'SOL' | 'USDC' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="SOL">SOL</option>
                <option value="USDC">USDC</option>
              </select>
            </div>

            <div>
              <label htmlFor="totalBudget" className="block text-sm font-medium text-gray-700 mb-2">
                Total Budget *
              </label>
              <input
                type="number"
                id="totalBudget"
                required
                min={1}
                step="0.01"
                value={formData.totalBudget}
                onChange={(e) => setFormData({ ...formData, totalBudget: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="rewardPerAcceptedFeedback" className="block text-sm font-medium text-gray-700 mb-2">
                Reward per Accepted Feedback *
              </label>
              <input
                type="number"
                id="rewardPerAcceptedFeedback"
                required
                min={0.1}
                step="0.01"
                value={formData.rewardPerAcceptedFeedback}
                onChange={(e) => setFormData({ ...formData, rewardPerAcceptedFeedback: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Accepted Feedbacks
              </label>
              <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                <span className="text-lg font-semibold">{maxAcceptedFeedbacks}</span>
                <span className="text-sm text-gray-500 ml-2">
                  (calculated automatically)
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting || !isConnected}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Create & Pay'}
            </button>
            {!isConnected && (
              <p className="mt-2 text-sm text-gray-500 text-center">
                Please connect your wallet to continue
              </p>
            )}
          </div>
        </form>
      </main>
    </div>
  )
}

