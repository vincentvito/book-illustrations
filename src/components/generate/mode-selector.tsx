'use client'

import { BookImage, Image, Images } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { GenerationMode } from '@/types/generation'

interface ModeSelectorProps {
  selected: GenerationMode | null
  onSelect: (mode: GenerationMode) => void
}

const modes = [
  {
    id: 'cover' as const,
    title: 'Generate Cover',
    description: 'Create a stunning book cover illustration with space for your title',
    icon: BookImage,
  },
  {
    id: 'single' as const,
    title: 'Single Illustration',
    description: 'Generate one key illustration from your story',
    icon: Image,
  },
  {
    id: 'all' as const,
    title: 'All Illustrations',
    description: 'Generate illustrations for every key section of your story',
    icon: Images,
  },
]

export function ModeSelector({ selected, onSelect }: ModeSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {modes.map((mode) => {
        const Icon = mode.icon
        return (
          <Card
            key={mode.id}
            selected={selected === mode.id}
            hoverable
            onClick={() => onSelect(mode.id)}
            className="text-center"
          >
            <Icon className={`mx-auto mb-3 h-8 w-8 ${
              selected === mode.id ? 'text-indigo-600' : 'text-gray-400'
            }`} />
            <h3 className="mb-1 font-semibold text-gray-900">{mode.title}</h3>
            <p className="text-sm text-gray-500">{mode.description}</p>
          </Card>
        )
      })}
    </div>
  )
}
