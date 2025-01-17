import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { MessageRole } from '@prisma/client';
import { gptGenerate } from '@/lib/ai/gpt';
import { createPrompt } from '@/lib/ai/prompts';
import { randomUUID } from 'crypto';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { workspaceId } = await params;
    const { tool, selectedText } = await req.json();

    if(tool === "NONE") return new NextResponse('No tool selected', { status: 403 });

    // Get the workspace context
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        context: {
          include: {
            messages: true
          }
        }
      }
    });

    if (!workspace) return new NextResponse('Workspace not found', { status: 404 });

    // Create tool-specific message
    const toolMessage = `@${tool}Tool ${selectedText}`;
    
    // Create new message for the tool request
    const newUserMessage = await prisma.message.create({
      data: {
        role: MessageRole.USER,
        content: toolMessage,
        context: {
          connect: { id: workspace.context?.id }
        }
      }
    });

    // Get updated context with all messages
    const context = await prisma.context.findUniqueOrThrow({
      where: { id: workspace.context?.id },
      include: {
        messages: true
      }
    });

    // Generate AI response using the tool-specific prompt
    const promptParams = {
      selectedText,
      selectedWord: selectedText,
      misspelledWord: selectedText,
      correctSpelling: "" // You might want to implement spell checking here
    };
    
    const toolPrompt = createPrompt(tool, promptParams);
    const aiResponse = await gptGenerate([
        ...context.messages, 
        { 
            role: MessageRole.SYSTEM, 
            content: toolPrompt, 
            id: randomUUID(), 
            createdAt: new Date(), 
            updatedAt: new Date(), 
            contextId: randomUUID(),
        }
    ]);

    if (!aiResponse) return new NextResponse('Ai failed to generate response', { status: 500 });

    // Save AI response
    const newSystemMessage = await prisma.message.create({
      data: {
        role: MessageRole.SYSTEM,
        content: aiResponse,
        context: {
          connect: { id: workspace.context?.id }
        }
      }
    });

    return NextResponse.json({ aiResponse, newUserMessage, newSystemMessage });
  } catch (error) {
    console.error('Error processing tool request:', error);
    if (error instanceof Error) {
      return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}