'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useWallet } from '@/components/WalletProvider'
import WalletButton from '@/components/WalletButton'
import { formatCurrency, formatDate, truncateAddress } from '@/lib/utils'

interface Feedback {
  id: string
  body: string
  experienceTag: string
  status: 'PENDING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
  contributor: {
    id: string
    name: string | null
    walletAddress: string
  }
  payout: {
    id: string
    txSignature: string | null
    status: string
    amount: number
  } | null
}

interface Idea {
  id: string
  title: string
  description: string
  context: string | null
  status: string
  currency: 'SOL' | 'USDC'
  totalBudget: number
  rewardPerAcceptedFeedback: number
  maxAcceptedFeedbacks: number
  acceptedCount: number
  escrowTxSignature: string | null
  createdAt: string
  founder: {
    id: string
    name: string | null
    walletAddress: string
  }
  feedbacks: Feedback[]
}

export default function IdeaRoomPage() {
  const params = useParams()
  const router = useRouter()
  const { walletAddress, isConnected } = useWallet()
  const [idea, setIdea] = useState<Idea | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackBody, setFeedbackBody] = useState('')
  const [experienceTag, setExperienceTag] = useState('')

  const isFounder = idea && walletAddress === idea.founder.walletAddress

  useEffect(() => {
    fetchIdea()
  }, [params.id])

  const fetchIdea = async () => {
    try {
      // Try to fetch from API
      const response = await fetch(`/api/ideas/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setIdea(data.idea)
        setLoading(false)
        return
      }
    } catch (err) {
      // Fall through to mock data
    }

    // Use mock data if API fails or for preview
    if (params.id === '1' || params.id === 'preview') {
      const { mockIdea } = await import('@/lib/mockData')
      setIdea(mockIdea as any)
    } else {
      setError('Idea not found')
    }
    setLoading(false)
  }

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected || !walletAddress) {
      alert('Please connect your wallet first')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/ideas/${params.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          body: feedbackBody,
          experienceTag,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit feedback')
      }

      setFeedbackBody('')
      setExperienceTag('')
      fetchIdea() // Refresh
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFeedbackAction = async (feedbackId: string, action: 'shortlist' | 'accept' | 'reject') => {
    if (!isConnected || !walletAddress) {
      alert('Please connect your wallet first')
      return
    }

    try {
      const response = await fetch(`/api/feedback/${feedbackId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${action} feedback`)
      }

      fetchIdea() // Refresh
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleSendPayout = async (payoutId: string) => {
    try {
      const response = await fetch(`/api/payouts/${payoutId}/send`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send payout')
      }

      fetchIdea() // Refresh
      alert('Payout sent successfully!')
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !idea) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Idea not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const remainingAccepts = idea.maxAcceptedFeedbacks - idea.acceptedCount

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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Idea Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{idea.title}</h1>
          <p className="text-gray-600 mb-4">{idea.description}</p>
          {idea.context && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Additional Context</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{idea.context}</p>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Posted by</span>
              <p className="font-medium">
                {idea.founder.name || truncateAddress(idea.founder.walletAddress)}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Budget</span>
              <p className="font-medium">{formatCurrency(idea.totalBudget, idea.currency)}</p>
            </div>
            <div>
              <span className="text-gray-500">Reward per feedback</span>
              <p className="font-medium">
                {formatCurrency(idea.rewardPerAcceptedFeedback, idea.currency)}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Status</span>
              <p className="font-medium">
                {idea.feedbacks.length} submitted, {idea.acceptedCount} accepted
                {isFounder && ` (${remainingAccepts} left)`}
              </p>
            </div>
          </div>

          {idea.escrowTxSignature && (
            <div className="mt-4 text-xs text-gray-500">
              Payment confirmed:{' '}
              <a
                href={`https://solscan.io/tx/${idea.escrowTxSignature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View transaction
              </a>
            </div>
          )}
        </div>

        {/* Feedback Thread */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Feedback ({idea.feedbacks.length})
          </h2>

          {idea.feedbacks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No feedback yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {idea.feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className={`p-4 rounded-lg border ${
                    feedback.status === 'ACCEPTED'
                      ? 'bg-green-50 border-green-200'
                      : feedback.status === 'SHORTLISTED'
                      ? 'bg-yellow-50 border-yellow-200'
                      : feedback.status === 'REJECTED'
                      ? 'bg-red-50 border-red-200 opacity-60'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {feedback.contributor.name ||
                            truncateAddress(feedback.contributor.walletAddress)}
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {feedback.experienceTag}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            feedback.status === 'ACCEPTED'
                              ? 'bg-green-200 text-green-800'
                              : feedback.status === 'SHORTLISTED'
                              ? 'bg-yellow-200 text-yellow-800'
                              : feedback.status === 'REJECTED'
                              ? 'bg-red-200 text-red-800'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          {feedback.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(new Date(feedback.createdAt))}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700 whitespace-pre-wrap mb-3">{feedback.body}</p>

                  {feedback.status === 'ACCEPTED' && feedback.payout && (
                    <div className="mt-3 p-2 bg-green-100 rounded text-sm">
                      <span className="font-medium">✅ Accepted — Reward: </span>
                      {formatCurrency(feedback.payout.amount, idea.currency)}
                      {feedback.payout.txSignature ? (
                        <span className="ml-2">
                          <a
                            href={`https://solscan.io/tx/${feedback.payout.txSignature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View transaction
                          </a>
                        </span>
                      ) : feedback.payout.status === 'PENDING' ? (
                        <span className="ml-2 text-orange-600">
                          (Payout pending -{' '}
                          <button
                            onClick={() => handleSendPayout(feedback.payout!.id)}
                            className="underline"
                          >
                            Send now
                          </button>
                          )
                        </span>
                      ) : null}
                    </div>
                  )}

                  {isFounder && feedback.status === 'PENDING' && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleFeedbackAction(feedback.id, 'shortlist')}
                        className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => handleFeedbackAction(feedback.id, 'accept')}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleFeedbackAction(feedback.id, 'reject')}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {isFounder && feedback.status === 'SHORTLISTED' && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleFeedbackAction(feedback.id, 'accept')}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleFeedbackAction(feedback.id, 'reject')}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feedback Composer */}
        {idea.status === 'OPEN' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit Feedback</h2>
            {!isConnected ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">Connect your wallet to submit feedback</p>
                <WalletButton />
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Experience / Background *
                  </label>
                  <input
                    type="text"
                    required
                    minLength={5}
                    maxLength={100}
                    value={experienceTag}
                    onChange={(e) => setExperienceTag(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 'I am a founder in SaaS', 'I run a marketing agency'"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback * (minimum 300 characters)
                  </label>
                  <textarea
                    required
                    minLength={300}
                    maxLength={10000}
                    rows={8}
                    value={feedbackBody}
                    onChange={(e) => setFeedbackBody(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Provide detailed, real-world feedback based on your experience..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {feedbackBody.length}/300 characters minimum
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || feedbackBody.length < 300}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

