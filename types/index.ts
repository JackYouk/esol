import { Prisma } from "@prisma/client";

export type WorkspaceWithRelations = Prisma.WorkspaceGetPayload<{
    include: {
        user: true
        context: {
            include: {
                messages: true
            }
        }
    }
}>

export type ToolType = "GRAMMAR" | "VOCABULARY" | "SPELLING" | "NONE";