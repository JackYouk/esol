import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

async function checkAndCreateUser(user: any | null) {
  if (!user) return null

  const existingUser = await prisma.user.findUnique({
    where: { id: user.id }
  })

  if (!existingUser) {
    return await prisma.user.create({
      data: {
        id: user.id,
        type: 'STUDENT',
        email: user.emailAddresses[0]?.emailAddress || '',
        username: user.username || user.firstName || 'User'
      }
    })
  }

  return existingUser
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