'use client'

import { useState, useEffect, useCallback } from 'react'
import { Textarea } from "@/components/ui/textarea"
import { debounce } from 'lodash'

interface NotesProps {
  workspaceId: string
  initialNotes?: string
}

export function Notes({ workspaceId, initialNotes = '' }: NotesProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Create a stable debounced save function that won't be recreated on every render
  const saveNotes = useCallback(
    debounce(async (content: string) => {
      try {
        setIsSaving(true)
        const response = await fetch(`/api/workspaces/${workspaceId}/save-notes`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notes: content }),
        })

        if (!response.ok) {
          throw new Error('Failed to save notes')
        }
        setHasUnsavedChanges(false)
      } catch (error) {
        console.error('Error saving notes:', error)
      } finally {
        setIsSaving(false)
      }
    }, 5000, { maxWait: 10000 }), 
    [workspaceId] // Only recreate if workspaceId changes
  )

  const handleNotesChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = event.target.value
    setNotes(newNotes)
    setHasUnsavedChanges(true)
    saveNotes(newNotes)
  }, [saveNotes])

  // Save on unmount if there are unsaved changes
  useEffect(() => {
    return () => {
      if (hasUnsavedChanges) {
        saveNotes.flush()
      }
      saveNotes.cancel()
    }
  }, [hasUnsavedChanges, saveNotes])

  return (
    <div className="relative w-full h-full">
      <Textarea
        value={notes}
        onChange={handleNotesChange}
        placeholder="This is the notes section..."
        className="resize-none outline-none border-none shadow-none focus-none h-full rounded-none"
      />
      {(isSaving || hasUnsavedChanges) && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          {isSaving ? 'Saving...' : 'Unsaved changes'}
        </div>
      )}
    </div>
  )
}