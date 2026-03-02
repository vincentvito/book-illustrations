'use client'

import { Download, Image } from 'lucide-react'
import type { GenerationRecord } from '@/types/story'

export function GenerationCard({ generation }: { generation: GenerationRecord }) {
  const handleDownload = async () => {
    if (!generation.image_url) return
    try {
      const response = await fetch(generation.image_url)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `illustration-${generation.id.slice(0, 8)}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  return (
    <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100">
        {generation.image_url ? (
          <img
            src={generation.image_url}
            alt={generation.subject}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Image className="h-10 w-10 text-gray-300" />
          </div>
        )}
        {/* Download overlay */}
        {generation.image_url && (
          <button
            onClick={handleDownload}
            className="absolute right-2 top-2 rounded-lg bg-white/90 p-2 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-white"
          >
            <Download className="h-4 w-4 text-gray-700" />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 line-clamp-2">{generation.subject}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">
            {generation.style}
          </span>
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600">
            {generation.palette}
          </span>
        </div>
      </div>
    </div>
  )
}
