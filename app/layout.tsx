import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { UserInitializer } from '@/components/UserInitializer'
import './globals.css'

export const metadata: Metadata = {
  title: 'CrackCheck',
  description: 'Crack checking application',
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