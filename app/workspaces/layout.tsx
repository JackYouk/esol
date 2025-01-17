import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { currentUser, User } from "@clerk/nextjs/server";
import Link from "next/link";

async function checkAndCreateUser(user: User | null) {
  if (!user) return null;

  try {
    // First check if user exists by ID
    const existingUserById = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (existingUserById) return existingUserById;

    // If not found by ID, check by email to handle the unique constraint
    const email = user.emailAddresses.find(
      email => email.id === user.primaryEmailAddressId
    )?.emailAddress || user.emailAddresses[0].emailAddress;

    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUserByEmail) {
      // If user exists with email but different ID, you might want to handle this case
      // For now, return existing user
      return existingUserByEmail;
    }

    // Create new user if doesn't exist by ID or email
    return await prisma.user.create({
      data: {
        id: user.id,
        type: 'STUDENT',
        email: email,
        username: user.username || user.firstName || 'User'
      }
    });
  } catch (error) {
    console.error('Error in checkAndCreateUser:', error);
    throw error;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser()
  await checkAndCreateUser(user)

  return (
    <>
        <SignedOut>
          <div className="w-full h-screen flex flex-col items-center justify-center font-[family-name:var(--font-geist-sans)]">
            <div className="text-2xl mb-2">ESOL Ai</div>
            <SignInButton>
              <Button variant="default">Sign In</Button>
            </SignInButton>
          </div>
        </SignedOut>
        <SignedIn>
          <div className="w-full flex items-center justify-between py-2 px-4 bg-secondary fixed">
            <div className="flex space-y-2">
              <Link href="/"><div className="font-bold">ESOL Ai</div></Link>
            </div>
            <UserButton />
          </div>
          {children}
        </SignedIn>
    </>
  );
}