'use client'

import { AmbientCard } from './ambient-card'
import type { Environment, EnvironmentReference } from '@/types/generation'
import type { BookGenre, AgeRange } from '@/types/book-profile'

interface AmbientGridProps {
  environments: Environment[]
  approvedRefs: EnvironmentReference[]
  styleTemplateId: string
  genre?: BookGenre
  ageRange?: AgeRange
  storyId?: string
  onUpdateEnvironment: (index: number, updated: Environment) => void
  onRemoveEnvironment: (index: number) => void
  onApproveEnvironment: (ref: EnvironmentReference) => void
}

export function AmbientGrid({
  environments,
  approvedRefs,
  styleTemplateId,
  genre,
  ageRange,
  storyId,
  onUpdateEnvironment,
  onRemoveEnvironment,
  onApproveEnvironment,
}: AmbientGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {environments.map((env, i) => (
        <AmbientCard
          key={`${env.name}-${i}`}
          environment={env}
          approvedRef={approvedRefs.find(
            r => r.environmentName === env.name
          )}
          styleTemplateId={styleTemplateId}
          genre={genre}
          ageRange={ageRange}
          storyId={storyId}
          onUpdate={(updated) => onUpdateEnvironment(i, updated)}
          onRemove={() => onRemoveEnvironment(i)}
          onApprove={onApproveEnvironment}
        />
      ))}
    </div>
  )
}
