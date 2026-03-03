'use client'

import { CharacterCard } from './character-card'
import type { Character, CharacterReference } from '@/types/generation'
import type { BookGenre, AgeRange } from '@/types/book-profile'

interface CharacterGridProps {
  characters: Character[]
  approvedRefs: CharacterReference[]
  styleTemplateId: string
  genre?: BookGenre
  ageRange?: AgeRange
  storyId?: string
  onUpdateCharacter: (index: number, updated: Character) => void
  onRemoveCharacter: (index: number) => void
  onApproveCharacter: (ref: CharacterReference) => void
}

export function CharacterGrid({
  characters,
  approvedRefs,
  styleTemplateId,
  genre,
  ageRange,
  storyId,
  onUpdateCharacter,
  onRemoveCharacter,
  onApproveCharacter,
}: CharacterGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {characters.map((character, i) => (
        <CharacterCard
          key={`${character.name}-${i}`}
          character={character}
          approvedRef={approvedRefs.find(
            r => r.characterName === character.name
          )}
          styleTemplateId={styleTemplateId}
          genre={genre}
          ageRange={ageRange}
          storyId={storyId}
          onUpdate={(updated) => onUpdateCharacter(i, updated)}
          onRemove={() => onRemoveCharacter(i)}
          onApprove={onApproveCharacter}
        />
      ))}
    </div>
  )
}
