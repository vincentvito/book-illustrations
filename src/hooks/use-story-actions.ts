'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface UseStoryActionsOptions {
  refetch: () => void
  onDeleted?: (storyId: string) => void
}

export function useStoryActions({ refetch, onDeleted }: UseStoryActionsOptions) {
  const [renaming, setRenaming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const renameStory = async (storyId: string, newTitle: string) => {
    setRenaming(true)
    try {
      const res = await fetch(`/api/stories/${storyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      })
      if (res.ok) {
        toast.success('Story renamed')
        refetch()
        return true
      } else {
        const data = await res.json().catch(() => null)
        toast.error(data?.error || 'Failed to rename story')
        return false
      }
    } catch {
      toast.error('Failed to rename story')
      return false
    } finally {
      setRenaming(false)
    }
  }

  const deleteStory = async (storyId: string) => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/stories/${storyId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Story deleted')
        refetch()
        onDeleted?.(storyId)
        return true
      } else {
        const data = await res.json().catch(() => null)
        toast.error(data?.error || 'Failed to delete story')
        return false
      }
    } catch {
      toast.error('Failed to delete story')
      return false
    } finally {
      setDeleting(false)
    }
  }

  return { renameStory, deleteStory, renaming, deleting }
}
