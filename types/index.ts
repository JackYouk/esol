import { Prisma } from "@prisma/client";


export type WorkspaceWithCreator = Prisma.WorkspaceGetPayload<{
    include: {
        creator: true
    }
}>