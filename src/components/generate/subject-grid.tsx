'use client'

import { Plus } from 'lucide-react'
import { SubjectCard } from './subject-card'
import type { Subject } from '@/types/generation'

interface SubjectGridProps {
  subjects: Subject[]
  selectedIds: number[]
  onSelect: (subject: Subject) => void
  onRegenerate: (subjectId: number) => void
  regeneratingId: number | null
  customIds: Set<number>
  onEdit: (updated: Subject) => void
  onDelete: (subjectId: number) => void
  onAdd: () => void
}

export function SubjectGrid({ subjects, selectedIds, onSelect, onRegenerate, regeneratingId, customIds, onEdit, onDelete, onAdd }: SubjectGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {subjects.map((subject) => (
        <SubjectCard
          key={subject.id}
          subject={subject}
          selected={selectedIds.includes(subject.id)}
          onSelect={() => onSelect(subject)}
          onRegenerate={() => onRegenerate(subject.id)}
          regenerating={regeneratingId === subject.id}
          editable={customIds.has(subject.id)}
          onEdit={onEdit}
          onDelete={() => onDelete(subject.id)}
        />
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white p-6 text-gray-400 transition-colors hover:border-orange-400 hover:text-orange-500"
      >
        <Plus className="h-8 w-8" />
        <span className="text-sm font-medium">Add Scene</span>
      </button>
    </div>
  )
}
