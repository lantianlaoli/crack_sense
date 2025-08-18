import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { UserInitializer } from '@/components/UserInitializer'
import './globals.css'

export const metadata: Metadata = {
  title: 'CrackCheck - Instant Wall Crack Analysis',
  description: 'Check wall cracks instantly with AI-powered analysis. Get peace of mind with professional crack assessment.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <UserInitializer />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}