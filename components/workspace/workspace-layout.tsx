'use client'

import { Button } from "@/components/ui/button";
import { ArrowRightSquareIcon, HomeIcon, MicIcon, UserPlus2Icon } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { DIsplayPDFViewer } from "@/components/workspace/pdf-viewer";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { WorkspaceWithCreator } from "@/types";

interface WorkspaceProps {
    workspace: WorkspaceWithCreator
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
        <div className="text-sm text-gray-500 italic">last updated 11/14/2023 at 8:56pm</div>
      </div>
      <ResizablePanelGroup direction="horizontal" className="pt-4">
        <ResizablePanel>
          <div className="h-full w-full pr-4">
            <DIsplayPDFViewer url={workspace.pdfUrl} />
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel>
              <Textarea placeholder="This is the notes section..." className="resize-none outline-none border-none shadow-none focus-none h-full rounded-none" />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
              <div className="w-full h-full px-3 py-2 flex flex-col justify-between">
                {/* This should be a markdown render of the ai context thread (which includes the tools) between the system and user */}
                <div className="space-y-1 text-sm font-gray-500">
                  <span className="font-bold">Esol Bot:</span> This is the ai's dialogue transcript
                  <br />
                  <span className="font-bold">{workspace.creator.username}:</span> This is the user's dialogue transcript
                </div>
                <div className="space-y-2">
                  <Textarea placeholder="Ask a question" rows={1} className="resize-none" />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">switch to voice <MicIcon /></Button>
                    <Button variant="outline">send message <ArrowRightSquareIcon /></Button>
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
