'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, formatDate, truncateAddress } from '@/lib/utils'

interface UserProfile {
  user: {
    id: string
    walletAddress: string
    name: string | null
    role: string
    createdAt: string
  }
  stats: {
    ideasPosted: number
    feedbacksGiven: number
    feedbacksAccepted: number
    totalEarned: number
  }
  ideasPosted: Array<{
    id: string
    title: string
    status: string
    createdAt: string
    feedbackCount: number
  }>
  feedbacks: Array<{
    id: string
    body: string
    status: string
    createdAt: string
    idea: {
      id: string
      title: string
    }
    payout: {
      amount: number
      currency: string
      status: string
      txSignature: string | null
    } | null
  }>
}

export default function ProfilePage() {
  const params = useParams()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [params.wallet])

  const fetchProfile = async () => {
    try {
      // Try to fetch from API
      const response = await fetch(`/api/users/${params.wallet}`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setLoading(false)
        return
      }
    } catch (err) {
      // Fall through to mock data
    }

    // Use mock data if API fails or for preview
    const { mockUser } = await import('@/lib/mockData')
    setProfile(mockUser as any)
    setLoading(false)
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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Profile not found'}</p>
          <Link
            href="/"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              VCTX Feedback Hub
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile</h1>
          <div className="space-y-2">
            <div>
              <span className="text-gray-500">Wallet Address:</span>
              <p className="font-mono text-sm">{profile.user.walletAddress}</p>
            </div>
            {profile.user.name && (
              <div>
                <span className="text-gray-500">Name:</span>
                <p className="font-medium">{profile.user.name}</p>
              </div>
            )}
            <div>
              <span className="text-gray-500">Role:</span>
              <p className="font-medium capitalize">{profile.user.role.toLowerCase()}</p>
            </div>
            <div>
              <span className="text-gray-500">Member since:</span>
              <p className="font-medium">{formatDate(new Date(profile.user.createdAt))}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Ideas Posted</p>
            <p className="text-2xl font-bold text-gray-900">{profile.stats.ideasPosted}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Feedbacks Given</p>
            <p className="text-2xl font-bold text-gray-900">{profile.stats.feedbacksGiven}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Feedbacks Accepted</p>
            <p className="text-2xl font-bold text-gray-900">{profile.stats.feedbacksAccepted}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Earned</p>
            <p className="text-2xl font-bold text-green-600">
              {profile.stats.totalEarned > 0
                ? `~${profile.stats.totalEarned.toFixed(2)}`
                : '0'}
            </p>
          </div>
        </div>

        {profile.ideasPosted.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ideas Posted</h2>
            <div className="space-y-3">
              {profile.ideasPosted.map((idea) => (
                <Link
                  key={idea.id}
                  href={`/ideas/${idea.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{idea.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {idea.feedbackCount} feedbacks • {formatDate(new Date(idea.createdAt))}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        idea.status === 'OPEN'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {idea.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {profile.feedbacks.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Feedbacks Given</h2>
            <div className="space-y-4">
              {profile.feedbacks.map((feedback) => (
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
                    <Link
                      href={`/ideas/${feedback.idea.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {feedback.idea.title}
                    </Link>
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
                  <p className="text-sm text-gray-700 line-clamp-2 mb-2">{feedback.body}</p>
                  {feedback.status === 'ACCEPTED' && feedback.payout && (
                    <div className="text-sm">
                      <span className="font-medium">Reward: </span>
                      {formatCurrency(
                        feedback.payout.amount,
                        feedback.payout.currency as 'SOL' | 'USDC'
                      )}
                      {feedback.payout.txSignature && (
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
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDate(new Date(feedback.createdAt))}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

