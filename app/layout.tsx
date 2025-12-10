import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletProvider } from '@/components/WalletProvider'
import PreviewBanner from '@/components/PreviewBanner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VCTX Feedback Hub',
  description: 'Idea validation with paid feedback on Solana',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <PreviewBanner />
          {children}
        </WalletProvider>
      </body>
    </html>
  )
}

