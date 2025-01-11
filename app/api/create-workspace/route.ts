import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { CreateWorkspaceSchema } from '@/components/forms/schema';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Parse and validate the request body
    const body = await req.json();
    const validationResult = CreateWorkspaceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { title, description, pdf, aiModel } = validationResult.data;

    // Create vercel blob from pdf


    // Create workspace with nested relations
    const workspace = await prisma.workspace.create({
      data: {
        title,
        description,
        activeAi: aiModel,
        pdfUrl: "",
        creator: {
          connect: { id: userId }
        },
        contexts: {
          create: {
            aiModel,
            vectordb: "", // Initialize empty for now, potentially will include vector db update in the future to reduce context
            user: {
              connect: { id: userId }
            },
            messages: {
              create: {
                content: "",
              },
            },
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        sharedUsers: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        contexts: {
          include: {
            messages: {
              select: {
                id: true,
                content: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(workspace);
  } catch (error) {
    console.error('Error creating workspace:', error);
    if (error instanceof Error) {
      return new NextResponse(`Error: ${error.message}`, { status: 500 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}