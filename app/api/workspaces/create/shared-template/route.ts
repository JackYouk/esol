import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { put } from "@vercel/blob"
import { parsePDFContent } from "../parsePdf"
import { MessageRole } from "@prisma/client"
import { createPrompt } from "@/lib/ai/prompts"

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = await auth()
    if (!userId) throw new Error("Unauthenticated")
    const { title, description, pdf, aiModel, memberIds } = await req.json()

    // Create vercel blob from pdf
    const pdfBuffer = Buffer.from(pdf.base64, "base64")
    const { url } = await put(`pdfs/${pdf.name}`, pdfBuffer, {
      access: "public",
      contentType: "application/pdf",
    })

    // Parse pdf for use in context
    const pdfContent = await parsePDFContent(pdfBuffer)

    // Create initial message text
    const initalMessageText = createPrompt("INIT", { studyText: pdfContent.text })

    // Get or create classroom
    let classroom
    if (orgId) {
      classroom = await prisma.classroom.findUnique({ where: { id: orgId } })
      if (!classroom) {
        classroom = await prisma.classroom.create({ data: { id: orgId } })
      }
    }

    // Create workspace with nested relations and (if provided) connect selected members.
    const workspace = await prisma.workspace.create({
      data: {
        title,
        description,
        activeAi: aiModel,
        pdfUrl: url,
        user: {
          connect: { id: userId },
        },
        ...(orgId && classroom && {
          classroom: {
            connect: { id: orgId },
          },
        }),
        context: {
          create: {
            aiModel,
            vectordb: "",
            messages: {
              create: {
                role: MessageRole.USER,
                content: initalMessageText,
              },
            },
          },
        },
        ...(memberIds &&
          memberIds.length > 0 && {
            members: {
              connect: memberIds.map((id: string) => ({ id })),
            },
          }),
      },
      select: {
        id: true,
      },
    })

    return NextResponse.json({ id: workspace.id })
  } catch (error) {
    console.error("Error creating workspace:", error)
    if (error instanceof Error) {
      return new NextResponse(`Error: ${error.message}`, { status: 500 })
    }
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
