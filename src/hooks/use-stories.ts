'use client'

import { useEffect, useState, useCallback } from 'react'
import type { StoryListItem } from '@/types/story'

export function useStories() {
  const [stories, setStories] = useState<StoryListItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stories')
      if (res.ok) {
        const data = await res.json()
        setStories(data.stories)
      }
    } catch (error) {
      console.error('Failed to fetch stories:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStories()
  }, [fetchStories])

  return { stories, loading, refetch: fetchStories }
}
