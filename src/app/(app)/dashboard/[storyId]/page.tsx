'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GenerationGrid } from '@/components/dashboard/generation-grid'
import { useGenerationStore } from '@/stores/generation-store'
import type { StoryWithGenerations } from '@/types/story'

export default function StoryDetailPage() {
  const { storyId } = useParams<{ storyId: string }>()
  const router = useRouter()
  const { setStory, setStoryId } = useGenerationStore()
  const [story, setStoryData] = useState<StoryWithGenerations | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const res = await fetch(`/api/stories/${storyId}`)
        if (res.ok) {
          const data = await res.json()
          setStoryData(data.story)
        } else {
          router.push('/dashboard')
        }
      } catch {
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchStory()
  }, [storyId, router])

  const handleGenerateMore = () => {
    if (!story) return
    setStoryId(story.id)
    setStory(story.story_text, story.filename ?? undefined)
    router.push('/generate')
  }

  const handleDelete = async () => {
    if (!confirm('Delete this story? Generated illustrations will be kept but unlinked.')) return
    setDeleting(true)
    try {
      await fetch(`/api/stories/${storyId}`, { method: 'DELETE' })
      router.push('/dashboard')
    } catch {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    )
  }

  if (!story) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-3 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to stories
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{story.title}</h1>
            <p className="text-sm text-gray-500">
              {story.generations.length} {story.generations.length === 1 ? 'illustration' : 'illustrations'}
              {' \u00b7 '}
              Created {new Date(story.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleGenerateMore}>
              <Plus className="mr-2 h-4 w-4" />
              Generate More
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete} loading={deleting}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </div>

      {/* Generations */}
      <GenerationGrid generations={story.generations} onGenerateMore={handleGenerateMore} />
    </div>
  )
}
