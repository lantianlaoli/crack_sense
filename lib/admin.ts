import { User } from '@clerk/nextjs/server'

export function isAdmin(user: User | null | undefined): boolean {
  if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
    return false
  }

  const userEmail = user.emailAddresses[0].emailAddress
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL

  return userEmail === adminEmail
}

export function requireAdmin(user: User | null | undefined): void {
  if (!isAdmin(user)) {
    throw new Error('Admin access required')
  }
}