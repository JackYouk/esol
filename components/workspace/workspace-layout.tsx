'use client'

import { Button } from "@/components/ui/button";
import { ArrowRightSquareIcon, HomeIcon, MicIcon, UserPlus2Icon } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { DisplayPDFViewer } from "@/components/workspace/pdf-viewer";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { WorkspaceWithRelations } from "@/types";
import { ChatInterface } from "./chat";
import { Notes } from "./notes";
import { SelectedTextProvider } from "./selected-text-provider";
import { LearningToolbar } from "./toolbar";
import { useState } from "react";
import { Message, MessageRole } from "@prisma/client";

interface WorkspaceProps {
  workspace: WorkspaceWithRelations
}

const welcomeMessage: Message = {
  id: 'welcome',
  content: `Welcome to your workspace! I'm here to help you explore and understand your document. What would you like to know?`,
  role: 'SYSTEM',
  contextId: '',
  createdAt: new Date(),
  updatedAt: new Date()
}

export function WorkspaceLayout({ workspace }: WorkspaceProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    const initialMessages = workspace.context?.messages ?? [];
    if (initialMessages.length === 0) {
      return [welcomeMessage];
    }
    return [welcomeMessage, ...initialMessages.slice(1)];
  });

  const addMessage = (message: string) => {
    const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);
    setMessages([...messages, {
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      content: message,
      role: MessageRole.SYSTEM,
      contextId: generateId()
    }])
    console.log("hit")
  }

  return (
    <SelectedTextProvider>
      <div className="p-10 pt-16 h-screen">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-xl font-bold">{workspace?.title}</div>
            <Link href="/workspaces"><Button size="icon" variant="outline"><HomeIcon /></Button></Link>
            <Button size="icon" variant="outline"><UserPlus2Icon /></Button>
          </div>
          <div className="text-sm text-gray-500 italic">
            last updated {workspace.updatedAt.toLocaleDateString('en-US')} at {workspace.updatedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()}
          </div>
        </div>
        <ResizablePanelGroup direction="horizontal" className="pt-4">
          <ResizablePanel>
            <div className="h-full w-full pr-4">
              <DisplayPDFViewer workspaceId={workspace.id} url={workspace.pdfUrl} addMessage={addMessage} />
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel>
                <Notes workspaceId={workspace.id} initialNotes={workspace.notes ?? ""} />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel>
                <ChatInterface workspaceId={workspace.id} messages={messages} creator={workspace.creator} setMessages={setMessages} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </SelectedTextProvider>
  )
}
