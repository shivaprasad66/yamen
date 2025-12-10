import { prisma } from './prisma'
import { UserRole } from '@prisma/client'
import { walletAddressSchema } from './validations'

/**
 * Get or create user by wallet address
 */
export async function getOrCreateUser(walletAddress: string, name?: string) {
  const validatedAddress = walletAddressSchema.parse(walletAddress)
  
  const user = await prisma.user.upsert({
    where: { walletAddress: validatedAddress },
    update: {
      ...(name && { name }),
    },
    create: {
      walletAddress: validatedAddress,
      name: name || undefined,
      role: UserRole.CONTRIBUTOR,
    },
  })

  return user
}

/**
 * Check if user is founder of an idea
 */
export async function isIdeaFounder(ideaId: string, userId: string): Promise<boolean> {
  const idea = await prisma.idea.findFirst({
    where: {
      id: ideaId,
      founderId: userId,
    },
  })

  return idea !== null
}

/**
 * Update user role (e.g., when they post first idea)
 */
export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  })
}


