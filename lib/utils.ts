import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: 'SOL' | 'USDC'): string {
  return `${amount.toFixed(currency === 'SOL' ? 4 : 2)} ${currency}`
}

export function truncateAddress(address: string, start = 4, end = 4): string {
  if (address.length <= start + end) return address
  return `${address.slice(0, start)}...${address.slice(-end)}`
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

