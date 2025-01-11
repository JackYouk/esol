import { gptGenerate } from "@/lib/ai/gpt";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { MessageRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";



export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const workspaceId = params.id;
    const { messageText } = await req.json();

    // Find workspace and select for messages
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        context: {
          include: {
            messages: true
          }
        }
      }
    })

    if (!workspace) return new NextResponse('Workspace not found', { status: 404 });

    // Create new message for user
    const newUserMessage = await prisma.message.create({
      data: {
        role: MessageRole.USER,
        content: messageText,
        context: {
          connect: {
            id: workspace.context?.id
          }
        }
      }
    })

    const context = await prisma.context.findUniqueOrThrow({
      where: { id: workspace.context?.id },
      include: {
        messages: true
      }
    })

    // Send message thread to gpt
    const aiResponse = await gptGenerate(context.messages)
    if (!aiResponse) return new NextResponse('Error generating ai response', { status: 500 });

    // Create new message for user
    const newSystemMessage = await prisma.message.create({
      data: {
        role: MessageRole.SYSTEM,
        content: aiResponse,
        context: {
          connect: {
            id: workspace.context?.id
          }
        }
      }
    })


    return NextResponse.json({ aiResponse, newUserMessage, newSystemMessage });

  } catch (error) {
    console.error('Error creating workspace:', error);
    if (error instanceof Error) {
      return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}