import { AIModel } from "@prisma/client"
import { z } from "zod"

export const CreateWorkspaceSchema = z.object({
    title: z.string().min(4, {
        message: "Title must be at least 4 characters.",
    }),
    description: z.string().optional(),
    aiModel: z.nativeEnum(AIModel, {
        errorMap: () => ({ message: "Invalid AI model selection" }),
    }),
    pdf: z.object({
        name: z.string(),
        type: z.string(),
        size: z.number(),
        base64: z.string()
    }).refine((file) => file.type === "application/pdf", "Must be a PDF")
      .refine((file) => file.size <= 4.5 * 1024 * 1024, "File must be less than 4.5MB"),
})