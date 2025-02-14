"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { OrganizationSwitcher, Protect, UserButton } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import { Logo } from '../ui/logo'

export function Nav() {
    const pathname = usePathname()
    return (
        <div className="flex items-center space-x-4 bg-secondary py-2 px-4 rounded-lg border border-1 shadow-md">
            {/* <div className="font-bold text-2xl">ESOL Ai</div> */}
            <Logo />
            <div className="space-x-2">
                <Link href="/">
                    <Button size="sm">home</Button>
                </Link>
                {/* <Link href="/research">
            <Button size="sm">research</Button>
          </Link> */}
                {pathname === '/classroom' && (<>
                    <Link href="/workspaces">
                        <Button size="sm">workspaces</Button>
                    </Link>
                    <Protect role="org:admin">
                        <Link href="/classroom/manage">
                            <Button size="sm">manage classroom</Button>
                        </Link>
                    </Protect>
                </>)}

                {pathname === '/classroom/manage' && (<>
                    <Link href="/workspaces">
                        <Button size="sm">workspaces</Button>
                    </Link>
                    <Protect role="org:admin">
                        <Link href="/classroom">
                            <Button size="sm">classroom</Button>
                        </Link>
                    </Protect>
                </>)}
                
                {pathname === '/workspaces' && (
                    <Protect role="org:admin">
                        <Link href="/classroom">
                            <Button size="sm">classroom</Button>
                        </Link>
                    </Protect>
                )}
            </div>
            <UserButton />
            <OrganizationSwitcher />
        </div>
    )
}