/**
 * Environment variable validation
 * Ensures all required environment variables are set
 */

export function validateEnv() {
  const required = [
    'DATABASE_URL',
    'TREASURY_WALLET_PRIVATE_KEY',
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    )
  }

  // Validate treasury wallet private key format
  const privateKey = process.env.TREASURY_WALLET_PRIVATE_KEY!
  try {
    // Try parsing as JSON array (common format)
    JSON.parse(privateKey)
  } catch {
    // If not JSON, should be base58 string
    if (privateKey.length < 32) {
      throw new Error('TREASURY_WALLET_PRIVATE_KEY appears to be invalid')
    }
  }
}

// Validate on module load (server-side only)
if (typeof window === 'undefined') {
  try {
    validateEnv()
  } catch (error) {
    console.error('Environment validation failed:', error)
    // Don't throw in development to allow for easier setup
    if (process.env.NODE_ENV === 'production') {
      throw error
    }
  }
}


