import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'Virtual CMO OS — Growth Brain for Founders',
  description: 'Your AI-powered Chief Marketing Officer. Get a custom GTM strategy, daily action plans, and real-time growth coaching.',
  keywords: ['startup marketing', 'CMO', 'growth strategy', 'founder marketing', 'GTM'],
  openGraph: {
    title: 'Virtual CMO OS',
    description: 'AI-powered growth brain for founders',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: 'Satoshi, sans-serif',
              fontSize: '13.5px',
              borderRadius: '10px',
              border: '1px solid #EDE9E3',
              boxShadow: '0 4px 12px rgba(13,12,11,0.08)',
              background: '#FFFFFF',
              color: '#0D0C0B',
            },
            success: {
              iconTheme: { primary: '#2D6A4F', secondary: '#D8F3DC' },
            },
            error: {
              iconTheme: { primary: '#991B1B', secondary: '#FEE2E2' },
            },
          }}
        />
      </body>
    </html>
  )
}
