'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { mockIdeas } from '@/lib/mockData'

export default function Home() {
  const [ideas, setIdeas] = useState(mockIdeas)
  const [loading, setLoading] = useState(false)

  // Try to fetch real data, fallback to mock
  useEffect(() => {
    async function fetchIdeas() {
      try {
        setLoading(true)
        const response = await fetch('/api/ideas')
        if (response.ok) {
          const data = await response.json()
          setIdeas(data.ideas || mockIdeas)
        }
      } catch (error) {
        // Use mock data if API fails
        console.log('Using mock data for preview')
      } finally {
        setLoading(false)
      }
    }
    fetchIdeas()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              VCTX Feedback Hub
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/create"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Post Idea
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Open Ideas
          </h1>
          <p className="text-gray-600">
            Browse ideas seeking validation and earn rewards for quality feedback
          </p>
          {loading && (
            <p className="text-sm text-blue-600 mt-2">Loading ideas...</p>
          )}
        </div>

        {ideas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No open ideas yet.</p>
            <Link
              href="/create"
              className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Be the first to post an idea
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea) => (
              <Link
                key={idea.id}
                href={`/ideas/${idea.id === '1' ? 'preview' : idea.id}`}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {idea.title}
                </h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {idea.description}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Budget:</span>
                    <span className="font-medium">
                      {formatCurrency(idea.totalBudget, idea.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reward per feedback:</span>
                    <span className="font-medium">
                      {formatCurrency(idea.rewardPerAcceptedFeedback, idea.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Feedback:</span>
                    <span className="font-medium">
                      {idea.feedbackCount} submitted, {idea.acceptedCount} accepted
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Remaining:</span>
                    <span className="font-medium">
                      {idea.maxAcceptedFeedbacks - idea.acceptedCount} accepts left
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    By {idea.founder.name || idea.founder.walletAddress.slice(0, 8)}...
                    • {formatDate(idea.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

