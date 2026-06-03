import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Market Intelligence Engine',
  description: 'AI-powered crypto trading signals',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
