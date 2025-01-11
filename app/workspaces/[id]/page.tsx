import { WorkspaceLayout } from "@/components/workspace/workspace-layout"
import { prisma } from "@/lib/prisma"
import { WorkspaceWithCreator } from "@/types"

async function getWorkspace(workspaceId: string): Promise<WorkspaceWithCreator> {
  const workspace = await prisma.workspace.findUniqueOrThrow({
    where: {id: workspaceId},
    include: {
      creator: true
    }
  })
  return workspace
}

export default async function Workspace({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const workspaceId = (await params).id
  const workspace = await getWorkspace(workspaceId)

  return (
    <WorkspaceLayout workspace={workspace} />
  )
}
