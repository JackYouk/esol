"use client"

import { useEffect, useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LetterText, BookOpen, Pencil, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import Markdown from 'react-markdown';
import { ToolType } from '@/types';
import { useSelectedText } from './selected-text-provider';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '../ui/scroll-area';
import { Progress } from '../ui/progress';
import { MarkdownScrollArea } from './markdown-scrollarea';
import { Message } from '@prisma/client';

interface ToolState {
    selectedTool: ToolType | null;
    selectedText: string;
    isDialogOpen: boolean;
    response: string;
}

export function LearningToolbar({ workspaceId, addMessage }: { workspaceId: string, addMessage: (message: string) => void }) {
    const { value, setValue } = useSelectedText();
    const router = useRouter();
    const [progress, setProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    const [state, setState] = useState<ToolState>({
        selectedTool: "NONE",
        selectedText: "",
        isDialogOpen: false,
        response: ""
    });

    const handleToolSelect = (tool: ToolType) => {
        setState(prev => ({
            ...prev,
            selectedTool: tool
        }));
        // Clear current selection when tool changes
        setValue("");
    };

    const handleTextSelect = async () => {
        // Skip if no selection, no tool, or already processing
        if (!value ||
            state.selectedTool === "NONE" ||
            isProcessing ||
            value === state.selectedText) return;

        setIsProcessing(true);
        setProgress(0); // Reset progress

        setState(prev => ({
            ...prev,
            selectedText: value,
            isDialogOpen: true,
            response: ""
        }));

        // Quick initial progress
        setTimeout(() => setProgress(15), 100);

        // Start progress animation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev < 90) {
                    // Gradually slow down progress as it gets higher
                    const increment = Math.max(1, (95 - prev) / 10);
                    return Math.min(90, prev + increment);
                }
                return prev;
            });
        }, 100);

        try {
            const response = await fetch(`/api/workspaces/tool-response/${workspaceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tool: state.selectedTool,
                    selectedText: value,
                }),
            });

            if (!response.ok) throw new Error('Failed to get tool response');

            const data = await response.json();

            // Complete the progress
            clearInterval(progressInterval);
            setProgress(100);

            // Short delay before showing response
            await new Promise(resolve => setTimeout(resolve, 300));

            setState(prev => ({
                ...prev,
                response: data.aiResponse
            }));
            
            addMessage(data.aiResponse)
        } catch (error) {
            console.error('Error getting tool response:', error);
            clearInterval(progressInterval);
            setProgress(0);
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (value) {
            handleTextSelect();
        }
    }, [value]);


    return (
        <div className="rounded-lg px-2 py-0">
            <ToggleGroup type="single" defaultValue="NONE" onValueChange={(val) => handleToolSelect(val as ToolType)}>
                <ToggleGroupItem variant="outline" value="GRAMMAR">
                    <LetterText className="h-4 w-4" />
                    <span className="sr-only">Grammar Tool</span>
                </ToggleGroupItem>
                <ToggleGroupItem variant="outline" value="VOCABULARY">
                    <BookOpen className="h-4 w-4" />
                    <span className="sr-only">Vocabulary Tool</span>
                </ToggleGroupItem>
                <ToggleGroupItem variant="outline" value="SPELLING">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Spelling Tool</span>
                </ToggleGroupItem>
                <ToggleGroupItem variant="outline" value="NONE">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Stop selection</span>
                </ToggleGroupItem>
            </ToggleGroup>

            <Dialog open={state.isDialogOpen} onOpenChange={(open) => setState(prev => ({ ...prev, isDialogOpen: open }))}>
                <DialogContent className="max-w-[1000px]">
                    <DialogHeader>
                        <DialogTitle>{state.selectedTool} Analysis</DialogTitle>
                    </DialogHeader>
                    {state.response ? (
                        <MarkdownScrollArea content={state.response} />
                    ) : (
                            <Progress value={progress} />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}