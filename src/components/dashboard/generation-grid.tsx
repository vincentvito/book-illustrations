'use client'

import { Image, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GenerationCard } from './generation-card'
import type { GenerationRecord } from '@/types/story'

interface GenerationGridProps {
  generations: GenerationRecord[]
  onGenerateMore: () => void
}

export function GenerationGrid({ generations, onGenerateMore }: GenerationGridProps) {
  if (generations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 px-6 text-center">
        <Image className="mb-3 h-10 w-10 text-gray-300" />
        <h3 className="mb-1 font-semibold text-gray-900">No illustrations yet</h3>
        <p className="mb-4 text-sm text-gray-500">Generate your first illustration for this story</p>
        <Button onClick={onGenerateMore}>
          <Plus className="mr-2 h-4 w-4" />
          Generate Illustrations
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {generations.map(gen => (
        <GenerationCard key={gen.id} generation={gen} />
      ))}
    </div>
  )
}
