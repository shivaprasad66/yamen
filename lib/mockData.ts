// Mock data for design preview (no APIs required)

export const mockIdeas = [
  {
    id: '1',
    title: 'AI-Powered Customer Support Platform',
    description: 'A platform that uses AI to provide instant customer support, reducing response times by 90% and improving customer satisfaction. The system learns from past interactions and can handle complex queries across multiple languages.',
    currency: 'SOL' as const,
    totalBudget: 50,
    rewardPerAcceptedFeedback: 5,
    maxAcceptedFeedbacks: 10,
    acceptedCount: 3,
    feedbackCount: 8,
    founder: {
      name: 'Alex Chen',
      walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    },
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Decentralized Freelance Marketplace',
    description: 'A blockchain-based platform connecting freelancers with clients, using smart contracts for escrow and automatic payments. No middleman fees, instant payments, and global access.',
    currency: 'USDC' as const,
    totalBudget: 100,
    rewardPerAcceptedFeedback: 10,
    maxAcceptedFeedbacks: 10,
    acceptedCount: 2,
    feedbackCount: 5,
    founder: {
      name: 'Sarah Johnson',
      walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    },
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    title: 'Sustainable Food Delivery Network',
    description: 'A carbon-neutral food delivery service that partners with local restaurants and uses electric vehicles. Customers can track their carbon footprint reduction in real-time.',
    currency: 'SOL' as const,
    totalBudget: 75,
    rewardPerAcceptedFeedback: 7.5,
    maxAcceptedFeedbacks: 10,
    acceptedCount: 1,
    feedbackCount: 4,
    founder: {
      name: null,
      walletAddress: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    },
    createdAt: new Date('2024-01-22'),
  },
]

export const mockIdea = {
  id: '1',
  title: 'AI-Powered Customer Support Platform',
  description: 'A platform that uses AI to provide instant customer support, reducing response times by 90% and improving customer satisfaction. The system learns from past interactions and can handle complex queries across multiple languages.',
  context: 'We\'ve been working on this for 6 months and have a working prototype. We\'re looking for feedback on:\n\n1. Pricing model - subscription vs pay-per-use\n2. Integration with existing CRM systems\n3. Market positioning against competitors\n\nOur target market is mid-size SaaS companies (50-500 employees).',
  status: 'OPEN',
  currency: 'SOL' as const,
  totalBudget: 50,
  rewardPerAcceptedFeedback: 5,
  maxAcceptedFeedbacks: 10,
  acceptedCount: 3,
  escrowTxSignature: '5j7s8K9mN2pQ4rT6vW8xY0zA1bC3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5z',
  founder: {
    id: 'founder-1',
    name: 'Alex Chen',
    walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  },
  feedbacks: [
    {
      id: 'feedback-1',
      body: 'As a founder of a SaaS company with 200 employees, I see huge potential here. The pricing model is critical - I\'d suggest a hybrid approach: base subscription for core features, then pay-per-use for advanced AI capabilities. This gives customers flexibility while ensuring predictable revenue for you. Integration with Salesforce and HubSpot should be prioritized as these are the most common CRMs in your target market.',
      experienceTag: 'Founder of SaaS company (200 employees)',
      status: 'ACCEPTED' as const,
      createdAt: new Date('2024-01-16T10:30:00'),
      contributor: {
        id: 'user-1',
        name: 'Michael Rodriguez',
        walletAddress: '3xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      },
      payout: {
        id: 'payout-1',
        txSignature: '2k8t9L0nO3qR5sU7wY9zA2bD4eF6gH8iJ0kL2mN4oP6qR8sT0uV2wX4yZ6a',
        status: 'SENT',
        amount: 5,
      },
    },
    {
      id: 'feedback-2',
      body: 'I run a marketing agency and we\'ve tested similar platforms. The key differentiator should be your learning algorithm - emphasize how it gets better over time. Also, consider offering a free tier for companies under 50 employees to build your user base. The carbon tracking feature you mentioned could be a unique selling point if positioned correctly.',
      experienceTag: 'Marketing agency owner',
      status: 'ACCEPTED' as const,
      createdAt: new Date('2024-01-17T14:20:00'),
      contributor: {
        id: 'user-2',
        name: 'Emily Watson',
        walletAddress: '4yLYuh3DX98e08UYJTEqcE6kifUjB94UAZSvKptAhBtV',
      },
      payout: {
        id: 'payout-2',
        txSignature: '3l9u0M1oP4rS6tV8xZ0aB3cE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7b',
        status: 'SENT',
        amount: 5,
      },
    },
    {
      id: 'feedback-3',
      body: 'From a technical perspective, make sure your API is well-documented. We\'ve had issues with other platforms where integration was a nightmare. Also, consider offering webhooks for real-time updates. The multi-language support is great, but ensure you have native speakers review translations - automated translations can miss context.',
      experienceTag: 'CTO at mid-size tech company',
      status: 'SHORTLISTED' as const,
      createdAt: new Date('2024-01-18T09:15:00'),
      contributor: {
        id: 'user-3',
        name: 'David Kim',
        walletAddress: '5zMZvi4EY09f19VZKUFrdF7ljgVkC05VBZTwLquBiCuW',
      },
      payout: null,
    },
    {
      id: 'feedback-4',
      body: 'I think the market is getting crowded. You need a stronger value proposition. What makes you different from Intercom or Zendesk? The AI angle is good but not unique anymore. Maybe focus on a specific vertical first - like healthcare or finance - where compliance and accuracy are critical.',
      experienceTag: 'Product manager with 10 years experience',
      status: 'PENDING' as const,
      createdAt: new Date('2024-01-19T16:45:00'),
      contributor: {
        id: 'user-4',
        name: 'Lisa Anderson',
        walletAddress: '6aNAwj5FZ10g20WALVGseG8mkWhD16WCZAxMrvCjDvX',
      },
      payout: null,
    },
  ],
  createdAt: new Date('2024-01-15'),
}

export const mockUser = {
  user: {
    id: 'user-1',
    walletAddress: '3xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    name: 'Michael Rodriguez',
    role: 'BOTH',
    createdAt: new Date('2024-01-01'),
  },
  stats: {
    ideasPosted: 2,
    feedbacksGiven: 12,
    feedbacksAccepted: 8,
    totalEarned: 40,
  },
  ideasPosted: [
    {
      id: 'idea-1',
      title: 'My First Idea',
      status: 'OPEN',
      createdAt: new Date('2024-01-10'),
      feedbackCount: 5,
    },
    {
      id: 'idea-2',
      title: 'Another Great Idea',
      status: 'CLOSED',
      createdAt: new Date('2024-01-05'),
      feedbackCount: 10,
    },
  ],
  feedbacks: [
    {
      id: 'fb-1',
      body: 'This is great feedback that was accepted...',
      status: 'ACCEPTED',
      createdAt: new Date('2024-01-16'),
      idea: {
        id: '1',
        title: 'AI-Powered Customer Support Platform',
      },
      payout: {
        amount: 5,
        currency: 'SOL',
        status: 'SENT',
        txSignature: '2k8t9L0nO3qR5sU7wY9zA2bD4eF6gH8iJ0kL2mN4oP6qR8sT0uV2wX4yZ6a',
      },
    },
  ],
}


