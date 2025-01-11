"use client"

import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CreateWorkspaceSchema } from "./schema"
import { Textarea } from "../ui/textarea"
import { useState } from "react"
import { Loader2, SquarePlus } from "lucide-react"
import { DialogFooter } from "../ui/dialog"
import { AIModel } from "@prisma/client"

export default function CreateWorkSpaceForm() {
    const router = useRouter()
    const [submitting, setSubmitting] = useState<boolean>(false);

    const form = useForm<z.infer<typeof CreateWorkspaceSchema>>({
        resolver: zodResolver(CreateWorkspaceSchema),
        defaultValues: {
            title: "",
            description: "",
            aiModel: AIModel.GPT
        },
    })

    async function onSubmit(data: z.infer<typeof CreateWorkspaceSchema>) {
        try {
            setSubmitting(true)
            const response = await fetch("/api/workspaces/create", {
                method: "POST",
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                // Optional: Parse the error response for debugging
                const errorData = await response.json();
                throw new Error(`Failed to create workspace: ${errorData.message || response.statusText}`);
            }
            
            const { id } = await response.json();

            toast({
                title: "Workspace created successfully!",
            })
            setSubmitting(false)
            router.push("/workspaces/" + id)
            router.refresh()
        } catch (error) {
            toast({
                title: "Error creating workspace",
                variant: "destructive"
            })
            setSubmitting(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full grid gap-4">

                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="My New Workspace" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea className="resize-none" placeholder="Learning about my favorite subject!" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="aiModel"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ai Model</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an Ai model" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value={AIModel.GPT}>GPT 4o</SelectItem>
                                    <SelectItem value={AIModel.CLAUDE} disabled>Claude Sonnet</SelectItem>
                                    <SelectItem value={AIModel.LLAMA} disabled>Llama 3</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="pdf"
                    render={({ field: { onChange, value, ...field } }) => (
                        <FormItem>
                            <FormLabel>Upload PDF</FormLabel>
                            <FormControl>
                                <Input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                            const reader = new FileReader()
                                            reader.onload = (e) => {
                                                const base64 = e.target?.result?.toString().split(',')[1]
                                                if (base64) {
                                                    onChange({
                                                        name: file.name,
                                                        type: file.type,
                                                        size: file.size,
                                                        base64: base64
                                                    })
                                                }
                                            }
                                            reader.readAsDataURL(file)
                                        }
                                    }}
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>PDFs must be equal to or less than 4.5MB</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <DialogFooter>
                    <Button className="w-full" type="submit" disabled={submitting}>
                        {!submitting ? (
                            <>Create <SquarePlus className="h-3 w-3" /></>
                        ) : (
                            <>Creating <Loader2 className="h-3 w-3 animate-spin" /></>
                        )}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    )
}