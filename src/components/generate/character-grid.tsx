'use client'

import { CharacterCard } from './character-card'
import type { Character, CharacterReference } from '@/types/generation'
import type { BookProfile } from '@/types/book-profile'

interface CharacterGridProps {
  characters: Character[]
  approvedRefs: CharacterReference[]
  style: string
  bookProfile?: BookProfile
  storyId?: string
  onUpdateCharacter: (index: number, updated: Character) => void
  onRemoveCharacter: (index: number) => void
  onApproveCharacter: (ref: CharacterReference) => void
}

export function CharacterGrid({
  characters,
  approvedRefs,
  style,
  bookProfile,
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
          style={style}
          bookProfile={bookProfile}
          storyId={storyId}
          onUpdate={(updated) => onUpdateCharacter(i, updated)}
          onRemove={() => onRemoveCharacter(i)}
          onApprove={onApproveCharacter}
        />
      ))}
    </div>
  )
}
