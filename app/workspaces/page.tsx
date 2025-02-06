import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { ArrowBigRight } from 'lucide-react'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { Button } from '@/components/ui/button'
import { Workspace } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { CreateWorkspaceModal } from '@/components/forms/create-workspace-modal'
import { getOrCreateUser } from '@/lib/user'
import { Nav } from '@/components/nav/nav'


async function getWorkspaces(): Promise<Workspace[]> {
  "use server"
  try {
    const { orgId } = await auth()
    const user = await getOrCreateUser()
    if (!user) return []

    const where = orgId
      ? { userId: user.id, classroomId: orgId } // Query for classroom if in clerk org
      : { userId: user.id } // Query for all if in personal clerk org

    const workspaces = await prisma.workspace.findMany({
      where,
      orderBy: { createdAt: "desc" }
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
      <Nav />
      <div className="w-full xl:w-5/6 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ">
        <CreateWorkspaceModal />
        {workspaces.map((workspace, index) => (
          <Card key={workspace.id} className="min-h-40 relative shadow-md">
            <CardHeader>
              <CardTitle>{workspace.title}</CardTitle>
              <CardDescription>{workspace.description}</CardDescription>
            </CardHeader>
            <div className="absolute bottom-4 right-4 flex justify-end items-center gap-2">
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