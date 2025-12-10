'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface WalletContextType {
  walletAddress: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
  signTransaction: (tx: string) => Promise<string>
  isConnected: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  useEffect(() => {
    // Check if already connected
    if (typeof window !== 'undefined' && window.solana?.isConnected) {
      setWalletAddress(window.solana.publicKey?.toString() || null)
    }

    // Listen for wallet events
    if (typeof window !== 'undefined' && window.solana) {
      window.solana.on('connect', () => {
        setWalletAddress(window.solana?.publicKey?.toString() || null)
      })

      window.solana.on('disconnect', () => {
        setWalletAddress(null)
      })
    }
  }, [])

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.solana) {
      // For preview mode, use a mock wallet address
      if (process.env.NODE_ENV === 'development') {
        setWalletAddress('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU')
        return
      }
      throw new Error('Please install Phantom or another Solana wallet extension')
    }

    try {
      const response = await window.solana.connect()
      setWalletAddress(response.publicKey.toString())
    } catch (error) {
      console.error('Error connecting wallet:', error)
      // For preview mode, use mock address on error
      if (process.env.NODE_ENV === 'development') {
        setWalletAddress('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU')
        return
      }
      throw error
    }
  }

  const disconnectWallet = async () => {
    if (typeof window !== 'undefined' && window.solana) {
      await window.solana.disconnect()
      setWalletAddress(null)
    }
  }

  const signTransaction = async (serializedTx: string): Promise<string> => {
    if (typeof window === 'undefined' || !window.solana || !walletAddress) {
      throw new Error('Wallet not connected')
    }

    const { Transaction, Connection } = await import('@solana/web3.js')
    
    // Get RPC URL
    let rpcUrl = 'https://api.devnet.solana.com'
    if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
      rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL
    } else if (process.env.NEXT_PUBLIC_HELIUS_API_KEY) {
      rpcUrl = `https://rpc.helius.xyz/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`
    }
    
    const connection = new Connection(rpcUrl, 'confirmed')

    const transaction = Transaction.from(Buffer.from(serializedTx, 'base64'))
    const signed = await window.solana.signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signed.serialize())
    await connection.confirmTransaction(signature, 'confirmed')

    return signature
  }

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        connectWallet,
        disconnectWallet,
        signTransaction,
        isConnected: !!walletAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

