"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ArrowRightSquareIcon } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Message } from "@prisma/client"

interface ChatInterfaceProps {
  workspaceId: string
  messages: Message[]
  creator: {
    username: string
  }
}

export function ChatInterface({ workspaceId, messages, creator }: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const welcomeMessage: Message = {
    id: 'welcome',
    content: `Welcome to your workspace! I'm here to help you explore and understand your document. What would you like to know?`,
    role: 'SYSTEM',
    contextId: '',
    createdAt: new Date(),
    updatedAt: new Date()
  }
  const [displayMessages, setDisplayMessages] = useState<Message[]>([welcomeMessage, ...messages.slice(1)])
  const handleSubmit = async () => {
    if (!inputMessage.trim() || isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/workspaces/new-message/${workspaceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageText: inputMessage }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      setDisplayMessages(prev => [...prev, data.newUserMessage, data.newSystemMessage])
      setInputMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="w-full h-full px-3 py-2 flex flex-col justify-between">
      <div className="space-y-1 text-sm text-gray-500 overflow-y-auto">
        {displayMessages.map((message, index) => (
          <div key={index}>
            <span className="font-bold">
              {message.role === 'SYSTEM' ? 'Esol Bot' : creator.username}:
            </span>{' '}
            {message.content}
            <br />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Textarea
          placeholder="Ask a question"
          rows={1}
          className="resize-none"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
        />
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            send message <ArrowRightSquareIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}