'use client'

import { Check } from 'lucide-react'

interface CharacterPortraitCandidatesProps {
  candidates: Array<{ imageUrl: string }>
  selectedIndex: number | null
  onSelect: (index: number) => void
  loading?: boolean
}

export function CharacterPortraitCandidates({
  candidates,
  selectedIndex,
  onSelect,
  loading,
}: CharacterPortraitCandidatesProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] animate-pulse rounded-lg bg-gray-200"
          />
        ))}
      </div>
    )
  }

  if (candidates.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-2">
      {candidates.map((candidate, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          className={`group relative aspect-[3/4] overflow-hidden rounded-lg border-2 transition-all ${
            selectedIndex === i
              ? 'border-orange-600 ring-2 ring-orange-200'
              : 'border-gray-200 hover:border-gray-400'
          }`}
        >
          <img
            src={candidate.imageUrl}
            alt={`Candidate ${i + 1}`}
            className="h-full w-full object-cover"
          />
          {selectedIndex === i && (
            <div className="absolute inset-0 flex items-center justify-center bg-orange-600/20">
              <div className="rounded-full bg-orange-600 p-1">
                <Check className="h-4 w-4 text-white" />
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
