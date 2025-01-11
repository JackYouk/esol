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

interface WorkspaceProps {
    workspace: WorkspaceWithRelations
}

export function WorkspaceLayout({ workspace }: WorkspaceProps) {

  return (
    <div className="p-10 pt-16 h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-xl font-bold">{workspace?.title}</div>
          <Link href="/workspaces"><Button size="icon" variant="outline"><HomeIcon /></Button></Link>
          <Button size="icon" variant="outline"><UserPlus2Icon /></Button>
          <Button variant="outline">vocab tool</Button>
          <Button variant="outline">grammar tool</Button>
          <Button variant="outline">spelling tool</Button>
        </div>
        <div className="text-sm text-gray-500 italic">
          last updated {workspace.updatedAt.toLocaleDateString('en-US')} at {workspace.updatedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()}
        </div>
        </div>
      <ResizablePanelGroup direction="horizontal" className="pt-4">
        <ResizablePanel>
          <div className="h-full w-full pr-4">
            <DisplayPDFViewer url={workspace.pdfUrl} />
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel>
              {/* <Textarea placeholder="This is the notes section..." className="resize-none outline-none border-none shadow-none focus-none h-full rounded-none" /> */}
              <Notes workspaceId={workspace.id} initialNotes={workspace.notes ?? ""} />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
              <ChatInterface workspaceId={workspace.id} messages={workspace.context?.messages ?? []} creator={workspace.creator} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
