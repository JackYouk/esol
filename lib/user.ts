import { auth, currentUser } from '@clerk/nextjs/server'
import { User } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export async function getOrCreateUser(): Promise<User | null> {
    // Try to find user first
    const { userId } = await auth()
    if (!userId) return null
    const foundUser = await prisma.user.findUnique({
      where: { id: userId },
    })
    if (foundUser) return foundUser
  
    // Create user if not found
    const clerkUser = await currentUser()
    if (!clerkUser) return null
    const userEmail = clerkUser.emailAddresses.find(
      email => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress || clerkUser.emailAddresses[0].emailAddress;
    return await prisma.user.create({
      data: {
        id: userId,
        email: userEmail,
        name: clerkUser.fullName!
      }
    })
  }