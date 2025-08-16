interface UserWithEmail {
  emailAddresses?: Array<{ emailAddress: string }>
}

export function isAdmin(user: UserWithEmail | null | undefined): boolean {
  if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
    return false
  }

  const userEmail = user.emailAddresses[0].emailAddress
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL

  return userEmail === adminEmail
}

export function requireAdmin(user: UserWithEmail | null | undefined): void {
  if (!isAdmin(user)) {
    throw new Error('Admin access required')
  }
}