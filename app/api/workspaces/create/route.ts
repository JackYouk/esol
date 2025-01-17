import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { put } from "@vercel/blob";
import { parsePDFContent } from './parsePdf';
import { MessageRole } from '@prisma/client';
import { createPrompt } from '@/lib/ai/prompts';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser()
    if (!userId || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const email = user.emailAddresses.find(
      email => email.id === user.primaryEmailAddressId
    )?.emailAddress || user.emailAddresses[0].emailAddress;

    const userData = await prisma.user.findUniqueOrThrow({
      where: { email: email }
    })

    const { title, description, pdf, aiModel } = await req.json()

    // Create vercel blob from pdf
    const pdfBuffer = Buffer.from(pdf.base64, 'base64');
    const { url } = await put(`pdfs/${pdf.name}`, pdfBuffer, {
      access: 'public',
      contentType: 'application/pdf'
    })

    // Parse pdf for use in context
    const pdfContent = await parsePDFContent(pdfBuffer);
    console.log(pdfContent)

    // Create initial message text
    const initalMessageText = createPrompt("INIT", { studyText: pdfContent.text })

    // Create workspace with nested relations
    const workspace = await prisma.workspace.create({
      data: {
        title,
        description,
        activeAi: aiModel,
        pdfUrl: url,
        creator: {
          connect: { id: userData.id }
        },
        context: {
          create: {
            aiModel,
            vectordb: "", // Initialize empty for now, potentially will include vector db update in the future to reduce context
            user: {
              connect: { id: userData.id }
            },
            messages: {
              create: {
                role: MessageRole.USER,
                content: initalMessageText,
              },
            },
          },
        },
      },
      select: {
        id: true
      },
    });

    return NextResponse.json({ id: workspace.id });
  } catch (error) {
    console.error('Error creating workspace:', error);
    if (error instanceof Error) {
      return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}