import { Nav } from "@/components/nav/nav";
import { ClassroomMembersTable } from "@/components/tables/classroom-members-table";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function getClassroomMembers() {
    try {
        const { orgId, has } = await auth()
        const permission = has({ role: "org:admin" })
        if (!orgId || !permission) redirect("/workspaces")

        const user = await getOrCreateUser()
        if (!user) throw new Error()

        const members = await prisma.user.findMany({
            where: {
                workspaces: {
                    some: {
                        classroomId: orgId
                    }
                }
            },
            include: {
                _count: {
                    select: {
                        workspaces: true
                    }
                },
                workspaces: {
                    where: {
                        classroomId: orgId
                    },
                    include: {
                        context: {
                            include: {
                                messages: {
                                    where: {
                                        role: "USER"
                                    },
                                    orderBy: {
                                        createdAt: "desc"
                                    },
                                    take: 1
                                },
                                _count: {
                                    select: {
                                        messages: {
                                            where: {
                                                role: "USER"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: "asc" }
        })

        // Transform the data to include total messages and last active
        return members.map(member => {
            // Calculate total messages across all workspaces
            const totalMessages = member.workspaces.reduce((sum, workspace) => {
                return sum + (workspace.context?._count.messages ?? 0)
            }, 0)

            // Find the most recent message date
            const lastActive = member.workspaces.reduce((latest: Date | null, workspace) => {
                if (!workspace.context?.messages.length) return latest
                const messageDate = workspace.context.messages[0].createdAt
                if (!latest) return messageDate
                return messageDate > latest ? messageDate : latest
            }, null)

            return {
                ...member,
                totalMessages,
                lastMessageAt: lastActive
            }
        })

    } catch (error) {
        console.error("Error fetching classroom members:", error)
        throw new Error()
    }
}

export default async function ClassroomPage() {
    const classroomMembers = await getClassroomMembers()

    return (
        <div className="min-h-screen w-screen bg-red flex flex-col items-center gap-10 pt-20 px-20 pb-10">
            <Nav />
            <ClassroomMembersTable data={classroomMembers} />
        </div>
    )
}