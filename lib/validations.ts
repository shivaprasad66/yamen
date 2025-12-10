import { z } from 'zod'

export const createIdeaSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(50).max(5000),
  context: z.string().max(10000).optional(),
  currency: z.enum(['SOL', 'USDC']),
  totalBudget: z.number().positive().min(1),
  rewardPerAcceptedFeedback: z.number().positive().min(0.1),
})

export const createFeedbackSchema = z.object({
  body: z.string().min(300).max(10000),
  experienceTag: z.string().min(5).max(100),
})

export const walletAddressSchema = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)

export const txSignatureSchema = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{64,128}$/)


