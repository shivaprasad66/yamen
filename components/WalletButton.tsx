'use client'

import { useWallet } from './WalletProvider'
import { useState } from 'react'

export default function WalletButton() {
  const { walletAddress, connectWallet, disconnectWallet, isConnected } = useWallet()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      await connectWallet()
    } catch (error: any) {
      alert(error.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnectWallet()
    } catch (error: any) {
      alert(error.message || 'Failed to disconnect wallet')
    }
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (isConnected && walletAddress) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
          {truncateAddress(walletAddress)}
        </div>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}
