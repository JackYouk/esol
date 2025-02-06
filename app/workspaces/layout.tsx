import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth()
  if(!userId) redirect("/login")
  return (
    <>
        <SignedIn>
          {/* <div className="w-full flex items-center justify-end p-4 fixed">
            <div className="flex items-center space-x-4 bg-secondary py-2 px-4 rounded-lg border border-2">
              <Link href="/">
                <div className="font-bold">ESOL Ai</div>
              </Link>
              <UserButton />
            </div>
          </div> */}
          {children}
        </SignedIn>
    </>
  );
}