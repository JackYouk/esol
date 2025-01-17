import { Prisma } from "@prisma/client";

export type WorkspaceWithCreator = Prisma.WorkspaceGetPayload<{
    include: {
        creator: true
    }
}>

export type WorkspaceWithRelations = Prisma.WorkspaceGetPayload<{
    include: {
        creator: true
        context: {
            include: {
                messages: true
            }
        }
    }
}>

export type ToolType = "GRAMMAR" | "VOCABULARY" | "SPELLING" | "NONE";