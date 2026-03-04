'use client'

import { Check, RefreshCw, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Subject } from '@/types/generation'

interface SubjectCardProps {
  subject: Subject
  selected: boolean
  onSelect: () => void
  onRegenerate: () => void
  regenerating?: boolean
  editable?: boolean
  onEdit?: (updated: Subject) => void
  onDelete?: () => void
}

export function SubjectCard({ subject, selected, onSelect, onRegenerate, regenerating, editable, onEdit, onDelete }: SubjectCardProps) {
  return (
    <Card selected={selected} hoverable onClick={onSelect}>
      <div className="mb-3 flex items-start justify-between">
        {editable ? (
          <input
            type="text"
            value={subject.title}
            placeholder="Scene title..."
            className="w-full rounded border border-gray-200 bg-gray-50 px-2 py-1 text-sm font-semibold text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onEdit?.({ ...subject, title: e.target.value })}
          />
        ) : (
          <h3 className="font-semibold text-gray-900">{subject.title}</h3>
        )}
        {selected && (
          <span className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-600">
            <Check className="h-4 w-4 text-white" />
          </span>
        )}
      </div>
      {editable ? (
        <textarea
          value={subject.description}
          placeholder="Describe the scene you want to illustrate..."
          rows={4}
          className="mb-3 w-full resize-none rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm text-gray-600 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onEdit?.({ ...subject, description: e.target.value })}
        />
      ) : (
        <p className="mb-3 text-sm text-gray-600">{subject.description}</p>
      )}
      {!editable && subject.storyContext && (
        <p className="mb-3 text-xs italic text-gray-400">{subject.storyContext}</p>
      )}
      {!editable && subject.storySection && (
        <p className="mb-3 text-xs text-orange-500">Section: {subject.storySection}</p>
      )}
      <div className="flex gap-2">
        {editable ? (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.()
            }}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
        ) : (
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
        )}
      </div>
    </Card>
  )
}
