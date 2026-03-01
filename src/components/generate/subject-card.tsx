'use client'

import { Check, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Subject } from '@/types/generation'

interface SubjectCardProps {
  subject: Subject
  selected: boolean
  onSelect: () => void
  onRegenerate: () => void
  regenerating?: boolean
}

export function SubjectCard({ subject, selected, onSelect, onRegenerate, regenerating }: SubjectCardProps) {
  return (
    <Card selected={selected} hoverable onClick={onSelect}>
      <div className="mb-3 flex items-start justify-between">
        <h3 className="font-semibold text-gray-900">{subject.title}</h3>
        {selected && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600">
            <Check className="h-4 w-4 text-white" />
          </span>
        )}
      </div>
      <p className="mb-3 text-sm text-gray-600">{subject.description}</p>
      <p className="mb-3 text-xs italic text-gray-400">{subject.storyContext}</p>
      {subject.storySection && (
        <p className="mb-3 text-xs text-indigo-500">Section: {subject.storySection}</p>
      )}
      <Button
        variant="outline"
        size="sm"
        loading={regenerating}
        onClick={(e) => {
          e.stopPropagation()
          onRegenerate()
        }}
      >
        <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
        Regenerate
      </Button>
    </Card>
  )
}
