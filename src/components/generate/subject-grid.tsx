'use client'

import { SubjectCard } from './subject-card'
import type { Subject } from '@/types/generation'

interface SubjectGridProps {
  subjects: Subject[]
  selectedIds: number[]
  onSelect: (subject: Subject) => void
  onRegenerate: (subjectId: number) => void
  regeneratingId: number | null
}

export function SubjectGrid({ subjects, selectedIds, onSelect, onRegenerate, regeneratingId }: SubjectGridProps) {
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
        />
      ))}
    </div>
  )
}
