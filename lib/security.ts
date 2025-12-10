/**
 * Security utilities
 */

import { walletAddressSchema } from './validations'

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validate wallet address format
 */
export function validateWalletAddress(address: string): boolean {
  try {
    walletAddressSchema.parse(address)
    return true
  } catch {
    return false
  }
}

/**
 * Rate limiting helper (simple in-memory version for MVP)
 * For production, use Redis or a proper rate limiting service
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + windowMs,
    })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

/**
 * Clean up old rate limit records periodically
 */
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(key)
    }
  }
}, 60000) // Clean up every minute


