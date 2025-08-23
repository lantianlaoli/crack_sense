import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { UserInitializer } from '@/components/UserInitializer'
import AdminButton from '@/components/AdminButton'
import './globals.css'

export const metadata: Metadata = {
  title: 'CrackSense - Intelligent Crack Analysis',
  description: 'Advanced AI-powered crack analysis for structural assessment. Get professional insights and peace of mind.',
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
          <AdminButton />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}