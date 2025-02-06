import { prisma } from "@/lib/prisma"
import { auth, currentUser } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    if (!userId || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const email = user.emailAddresses.find(
      email => email.id === user.primaryEmailAddressId
    )?.emailAddress || user.emailAddresses[0].emailAddress;

    const userData = await prisma.user.findUniqueOrThrow({
      where: {email: email}
    })

    const { workspaceId } = await params;
    const { notes } = await req.json()

    const workspace = await prisma.workspace.findUniqueOrThrow({
      where: {
        id: workspaceId,
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