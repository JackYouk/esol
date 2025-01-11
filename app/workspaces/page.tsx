import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ArrowBigRight, PlusSquareIcon, User2Icon } from 'lucide-react'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { Button } from '@/components/ui/button'
import { Workspace } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { CreateWorkspaceModal } from '@/components/forms/create-workspace-modal'

async function getWorkspaces(): Promise<Workspace[]> {
  const { userId } = await auth()
  
  if (!userId) return []

  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { sharedUsers: { some: { id: userId } } }
        ]
      },
      include: {
        creator: true,
        sharedUsers: true,
        contexts: true
      },
      // orderBy: {
      //   createdAt: 'desc' // Add this if you have a createdAt field
      // }
    })

    return workspaces
  } catch (error) {
    console.error("Error fetching workspaces:", error)
    return []
  }
}

export default async function WorkSpaces() {
  const workspaces = await getWorkspaces()

  return (
    <div className="h-screen w-screen bg-red flex flex-col items-center gap-10 pt-20">
      <div className="font-bold text-2xl">Workspaces</div>
      <div className="w-5/6 grid grid-cols-4 gap-4 ">
        <CreateWorkspaceModal />
        {workspaces.map((workspace, index) => (
          <Card key={workspace.id} className="min-h-40">
            <CardHeader>
              <CardTitle>{workspace.title}</CardTitle>
              <CardDescription>{workspace.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end items-center space-x-3">
              <Button size="icon" variant="secondary">
                <User2Icon />
              </Button>
              <Link href={"/workspaces/" + workspace.id}>
                <Button size="icon">
                  <ArrowBigRight className="" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}