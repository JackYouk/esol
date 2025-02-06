import { WorkspaceLayout } from "@/components/workspace/workspace-layout"
import { prisma } from "@/lib/prisma"
import { WorkspaceWithRelations } from "@/types"

async function getWorkspace(workspaceId: string): Promise<WorkspaceWithRelations> {
  const workspace = await prisma.workspace.findUniqueOrThrow({
    where: { id: workspaceId },
    include: {
      user: true,
      context: {
        include: {
          messages: true
        }
      }
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
