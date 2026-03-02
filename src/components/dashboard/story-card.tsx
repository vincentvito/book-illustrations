'use client'

import { useRouter } from 'next/navigation'
import { Image, Clock } from 'lucide-react'
import type { StoryListItem } from '@/types/story'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export function StoryCard({ story }: { story: StoryListItem }) {
  const router = useRouter()

  return (
    <div
      onClick={() => router.push(`/dashboard/${story.id}`)}
      className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Thumbnail */}
      <div className="aspect-[16/9] bg-gray-100">
        {story.thumbnail_url ? (
          <img
            src={story.thumbnail_url}
            alt={story.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Image className="h-10 w-10 text-gray-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors truncate">
          {story.title}
        </h3>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Image className="h-3.5 w-3.5" />
            {story.generation_count} {story.generation_count === 1 ? 'illustration' : 'illustrations'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {timeAgo(story.updated_at)}
          </span>
        </div>
      </div>
    </div>
  )
}
