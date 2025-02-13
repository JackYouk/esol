"use client";

import { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LetterText, BookOpen, Pencil, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from '../ui/progress';
import { MarkdownScrollArea } from './markdown-scrollarea';
import { ToolType } from '@/types';
import { Button } from '../ui/button';

interface LearningToolbarProps {
  workspaceId: string;
  addMessage: (message: string) => void;
  selectedText: string;
  position: { top: number; left: number };
  onClearSelection: () => void;
}

export default function LearningToolbar({
  workspaceId,
  addMessage,
  selectedText,
  position,
  onClearSelection,
}: LearningToolbarProps) {
  const [state, setState] = useState<{
    selectedTool: ToolType | null;
    isDialogOpen: boolean;
    response: string;
  }>({
    selectedTool: null,
    isDialogOpen: false,
    response: "",
  });
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToolClick = async (tool: ToolType) => {
    if (isProcessing) return
    setState({
      selectedTool: tool,
      isDialogOpen: true,
      response: "",
    });
    setIsProcessing(true);
    setProgress(0);

    // Start progress (initial quick jump)
    setTimeout(() => setProgress(15), 100);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 90) {
          const increment = Math.max(1, (95 - prev) / 10);
          return Math.min(90, prev + increment);
        }
        return prev;
      });
    }, 100);

    try {
      const response = await fetch(`/api/workspaces/tool-response/${workspaceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: tool,
          selectedText: selectedText,
        }),
      });
      if (!response.ok) throw new Error('Failed to get tool response');
      const data = await response.json();

      clearInterval(progressInterval);
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300));
      setState(prev => ({ ...prev, response: data.aiResponse }));
      addMessage(data.aiResponse);
    } catch (error) {
      console.error('Error getting tool response:', error);
      clearInterval(progressInterval);
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Floating toolbar positioned above the selection */}
      <div
        style={{
          top: position.top,
          left: position.left,
          position: 'absolute',
          transform: 'translate(-50%, -100%)',
          zIndex: 50,
        }}
        className="bg-white shadow-md rounded-md p-1 flex items-center gap-1"
      >
        <ToggleGroup
          type="single"
          value={state.selectedTool ? state.selectedTool : "NONE"}
          onValueChange={(val) => {
            handleToolClick(val as ToolType);
          }}
        >
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
          <Button size="icon" variant="destructive" onClick={onClearSelection}>
            <X className="h-4 w-4" />
            <span className="sr-only">Cancel</span>
          </Button>
        </ToggleGroup>
      </div>

      {/* Dialog showing the AI tool’s response */}
      <Dialog
        open={state.isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setState({
              selectedTool: null,
              isDialogOpen: false,
              response: "",
            });
            onClearSelection();
          }
        }}
      >
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
        <DialogFooter>
            
        </DialogFooter>
      </Dialog>
    </>
  );
}
