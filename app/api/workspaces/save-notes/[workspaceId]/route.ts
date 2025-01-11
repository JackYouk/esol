import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const workspaceId = params.workspaceId
    const { notes } = await req.json()

    // Check if user has access to this workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { creatorId: userId },
          { sharedUsers: { some: { id: userId } } }
        ]
      }
    })

    if (!workspace) {
      return new NextResponse('Workspace not found or access denied', { status: 404 })
    }

    // Update the workspace notes
    const updatedWorkspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { notes }
    })

    return NextResponse.json(updatedWorkspace)

  } catch (error) {
    console.error('Error updating workspace notes:', error)
    if (error instanceof Error) {
      return new NextResponse(`Error: ${error.message}`, { status: 500 })
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}