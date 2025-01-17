"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { ScrollArea } from "@/components/ui/scroll-area"

export function MarkdownScrollArea({ content }: { content: string }) {
  return (
    <ScrollArea className="h-96 rounded-md border p-2">
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
            p: ({node, ...props}) => <p className="inline" {...props} />,
            a: ({node, ...props}) => <a className="text-blue-500 hover:text-blue-600" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-6 my-2" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-2" {...props} />,
            li: ({node, ...props}) => <li className="my-1" {...props} />,
            code: ({node, ...props}) => <code className="block bg-gray-100 p-3 rounded-lg my-2 text-sm overflow-x-auto" {...props} />,
            pre: ({node, ...props}) => <pre className="bg-transparent p-0" {...props} />,
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-200 pl-4 my-2 italic" {...props} />,
            h1: ({node, ...props}) => <h1 className="text-xl font-bold my-3" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-lg font-bold my-2" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-base font-bold my-2" {...props} />,
            table: ({node, ...props}) => <table className="border-collapse table-auto w-full my-2" {...props} />,
            th: ({node, ...props}) => <th className="border border-gray-300 px-4 py-2 bg-gray-50" {...props} />,
            td: ({node, ...props}) => <td className="border border-gray-300 px-4 py-2" {...props} />
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </ScrollArea>
  )
}