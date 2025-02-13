"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ArrowRightSquareIcon } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Message, User } from "@prisma/client"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

interface ChatInterfaceProps {
  workspaceId: string
  messages: Message[]
  user: User
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
}

export function ChatInterface({ workspaceId, messages, user, setMessages }: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
      setMessages(prev => [...prev, data.newUserMessage, data.newSystemMessage])
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
      <div className="space-y-4 text-sm text-gray-500 overflow-y-auto">
        {messages.map((message, index) => (
          <div key={index} className="prose prose-sm max-w-none">
            <span className="font-bold text-gray-700">
              {message.role === 'SYSTEM' ? 'Esol Bot' : user.name}:
            </span>{' '}
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{
                p: ({node, ...props}) => <p className="inline" {...props} />,
                a: ({node, ...props}) => <a className="text-blue-500 hover:text-blue-600" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-6 my-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-2" {...props} />,
                li: ({node, ...props}) => <li className="my-1" {...props} />,
                code: ({node, ...props}) => 
                <code className="block bg-gray-100 p-3 rounded-lg my-2 text-sm overflow-x-auto" {...props} />,
                pre: ({node, ...props}) => <pre className="bg-transparent p-0" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-200 pl-4 my-2 italic" {...props} />,
                h1: ({node, ...props}) => <h1 className="text-xl font-bold my-3" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-lg font-bold my-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-base font-bold my-2" {...props} />
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ))}
        <div ref={messagesEndRef} />
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