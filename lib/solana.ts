import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from '@solana/web3.js'
import { getAssociatedTokenAddress, createTransferInstruction, getMint } from '@solana/spl-token'

// Initialize connection
const getConnection = () => {
  let rpcUrl: string
  
  if (process.env.HELIUS_API_KEY) {
    rpcUrl = `https://rpc.helius.xyz/?api-key=${process.env.HELIUS_API_KEY}`
  } else if (process.env.SOLANA_RPC_URL) {
    rpcUrl = process.env.SOLANA_RPC_URL
  } else {
    // Default to devnet public RPC
    const network = process.env.SOLANA_NETWORK || 'devnet'
    rpcUrl = network === 'mainnet-beta'
      ? 'https://api.mainnet-beta.solana.com'
      : 'https://api.devnet.solana.com'
  }
  
  return new Connection(rpcUrl, 'confirmed')
}

// Get treasury wallet (server-side only)
export const getTreasuryWallet = (): Keypair => {
  const privateKey = process.env.TREASURY_WALLET_PRIVATE_KEY
  if (!privateKey) {
    throw new Error('TREASURY_WALLET_PRIVATE_KEY is not set in environment variables')
  }

  try {
    // Private key should be base58 encoded
    const secretKey = Uint8Array.from(JSON.parse(privateKey))
    return Keypair.fromSecretKey(secretKey)
  } catch {
    // Try as base58 string
    const secretKey = Buffer.from(privateKey, 'base58')
    return Keypair.fromSecretKey(secretKey)
  }
}

// USDC mint address (devnet: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v, mainnet: different)
const USDC_MINT_DEVNET = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
const USDC_MINT_MAINNET = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') // Update with mainnet address

const getUSDCMint = (): PublicKey => {
  const network = process.env.SOLANA_NETWORK || 'devnet'
  return network === 'mainnet-beta' ? USDC_MINT_MAINNET : USDC_MINT_DEVNET
}

// Convert amount to proper units (SOL uses LAMPORTS, USDC uses decimals)
const toTokenAmount = (amount: number, currency: 'SOL' | 'USDC'): bigint => {
  if (currency === 'SOL') {
    return BigInt(Math.floor(amount * LAMPORTS_PER_SOL))
  } else {
    // USDC has 6 decimals
    return BigInt(Math.floor(amount * 1_000_000))
  }
}

/**
 * Create a transaction for founder to pay treasury
 * Returns the transaction in base64 format for client to sign
 */
export const createFounderToTreasuryTx = async (
  founderWallet: string,
  amount: number,
  currency: 'SOL' | 'USDC'
): Promise<string> => {
  const connection = getConnection()
  const treasuryWallet = getTreasuryWallet()
  const founderPubkey = new PublicKey(founderWallet)
  const treasuryPubkey = treasuryWallet.publicKey

  const transaction = new Transaction()

  if (currency === 'SOL') {
    // SOL transfer
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: founderPubkey,
        toPubkey: treasuryPubkey,
        lamports: toTokenAmount(amount, currency),
      })
    )
  } else {
    // USDC transfer
    const founderTokenAccount = await getAssociatedTokenAddress(
      getUSDCMint(),
      founderPubkey
    )
    const treasuryTokenAccount = await getAssociatedTokenAddress(
      getUSDCMint(),
      treasuryPubkey
    )

    transaction.add(
      createTransferInstruction(
        founderTokenAccount,
        treasuryTokenAccount,
        founderPubkey,
        toTokenAmount(amount, currency)
      )
    )
  }

  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = founderPubkey

  // Serialize transaction (client will sign and send)
  return transaction.serialize({ requireAllSignatures: false }).toString('base64')
}

/**
 * Send payment from treasury to contributor
 * This runs server-side and uses the treasury wallet
 */
export const sendTreasuryToContributorTx = async (
  contributorWallet: string,
  amount: number,
  currency: 'SOL' | 'USDC'
): Promise<string> => {
  const connection = getConnection()
  const treasuryWallet = getTreasuryWallet()
  const contributorPubkey = new PublicKey(contributorWallet)
  const treasuryPubkey = treasuryWallet.publicKey

  const transaction = new Transaction()

  if (currency === 'SOL') {
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: treasuryPubkey,
        toPubkey: contributorPubkey,
        lamports: toTokenAmount(amount, currency),
      })
    )
  } else {
    // USDC transfer
    const treasuryTokenAccount = await getAssociatedTokenAddress(
      getUSDCMint(),
      treasuryPubkey
    )
    const contributorTokenAccount = await getAssociatedTokenAddress(
      getUSDCMint(),
      contributorPubkey
    )

    transaction.add(
      createTransferInstruction(
        treasuryTokenAccount,
        contributorTokenAccount,
        treasuryPubkey,
        toTokenAmount(amount, currency)
      )
    )
  }

  // Sign and send transaction
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [treasuryWallet],
    { commitment: 'confirmed' }
  )

  return signature
}

/**
 * Verify a transaction signature
 */
export const verifyTransaction = async (signature: string): Promise<boolean> => {
  const connection = getConnection()
  try {
    const tx = await connection.getTransaction(signature, {
      commitment: 'confirmed',
    })
    return tx !== null && tx.meta?.err === null
  } catch {
    return false
  }
}

/**
 * Get wallet balance (SOL or USDC)
 */
export const getWalletBalance = async (
  walletAddress: string,
  currency: 'SOL' | 'USDC'
): Promise<number> => {
  const connection = getConnection()
  const pubkey = new PublicKey(walletAddress)

  if (currency === 'SOL') {
    const balance = await connection.getBalance(pubkey)
    return balance / LAMPORTS_PER_SOL
  } else {
    const tokenAccount = await getAssociatedTokenAddress(getUSDCMint(), pubkey)
    const balance = await connection.getTokenAccountBalance(tokenAccount)
    return Number(balance.value.amount) / 1_000_000
  }
}

