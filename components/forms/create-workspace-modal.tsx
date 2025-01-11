"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { PlusSquare } from "lucide-react"
import { Card } from "../ui/card"
import CreateWorkSpaceForm from "./create-workspace-form"

export function CreateWorkspaceModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Card className="cursor-pointer font-bold w-full min-h-40 h-full flex flex-col justify-center items-center text-sm hover:bg-secondary">
                    <PlusSquare className="w-16 h-16 mb-1" />
                    Create Workspace
                </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Workspace</DialogTitle>
                    <DialogDescription>
                        Deploy a new workspace and get to work!
                    </DialogDescription>
                </DialogHeader>
                <CreateWorkSpaceForm />
            </DialogContent>
        </Dialog>
    )
}
