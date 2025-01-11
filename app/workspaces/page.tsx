import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
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
        context: true
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
    <div className="min-h-screen w-screen bg-red flex flex-col items-center gap-10 pt-20 px-20 pb-10">
      <div className="font-bold text-2xl">Workspaces</div>
      <div className="w-full xl:w-5/6 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ">
        <CreateWorkspaceModal />
        {workspaces.map((workspace, index) => (
          <Card key={workspace.id} className="min-h-40 relative">
            <CardHeader>
              <CardTitle>{workspace.title}</CardTitle>
              <CardDescription>{workspace.description}</CardDescription>
            </CardHeader>
            <div className="absolute bottom-4 right-4 flex justify-end items-center gap-2">
              <Button variant="secondary">
                Users <User2Icon className="w-4 h-4" />
              </Button>
              <Link href={"/workspaces/" + workspace.id}>
                <Button>
                  Open <ArrowBigRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}