'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGenerationStore, useHydrationGuard } from '@/stores/generation-store'
import { CharacterGrid } from '@/components/generate/character-grid'
import { CharacterLibraryModal } from '@/components/generate/character-library-modal'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft, Plus, BookOpen, SkipForward, Loader2 } from 'lucide-react'
import type { Character, CharacterReference } from '@/types/generation'
import { WizardStepper } from '@/components/generate/wizard-stepper'

export default function CharactersPage() {
  const router = useRouter()
  const hasHydrated = useHydrationGuard()
  const {
    storyId, characters, setCharacters,
    approvedCharacterRefs, addApprovedCharacterRef, removeApprovedCharacterRef,
    renameCharacterInSubjects, style, bookProfile, mode,
  } = useGenerationStore()

  const [libraryOpen, setLibraryOpen] = useState(false)

  useEffect(() => {
    if (!hasHydrated) return
    if (!mode || mode !== 'all' || !style) {
      router.push('/generate/style')
    }
  }, [hasHydrated, mode, style, router])

  if (!hasHydrated || !mode || mode !== 'all' || !style) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const handleUpdateCharacter = (index: number, updated: Character) => {
    const next = [...characters]
    const oldName = next[index].name
    // If name changed, update approved refs and subject character lists
    if (oldName !== updated.name) {
      removeApprovedCharacterRef(oldName)
      if (oldName && updated.name) {
        renameCharacterInSubjects(oldName, updated.name)
      }
    }
    next[index] = updated
    setCharacters(next)
  }

  const handleRemoveCharacter = (index: number) => {
    removeApprovedCharacterRef(characters[index].name)
    setCharacters(characters.filter((_, i) => i !== index))
  }

  const handleAddCharacter = () => {
    setCharacters([...characters, { name: '', appearance: '' }])
  }

  const handleImportFromLibrary = (ref: CharacterReference) => {
    // Add to characters list if not already present
    const exists = characters.some(c => c.name === ref.characterName)
    if (!exists) {
      setCharacters([...characters, {
        name: ref.characterName,
        appearance: ref.appearanceDescription,
      }])
    }
    // Add as approved ref
    addApprovedCharacterRef(ref)
  }

  const allApproved = characters.length > 0 && characters.every(
    c => c.name && approvedCharacterRefs.some(r => r.characterName === c.name)
  )

  return (
    <div className="space-y-6">
      <WizardStepper />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Character Studio</h1>
          <p className="text-gray-500">
            Define and approve reference portraits for each character.
            These will be used for visual consistency across all illustrations.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLibraryOpen(true)}
          >
            <BookOpen className="mr-1.5 h-3.5 w-3.5" />
            Import from Library
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddCharacter}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Character
          </Button>
        </div>
      </div>

      {characters.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-gray-300 p-8">
          <p className="text-sm text-gray-500">
            No characters extracted from the story. Add characters manually or import from your library.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAddCharacter}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Character
            </Button>
            <Button variant="outline" size="sm" onClick={() => setLibraryOpen(true)}>
              <BookOpen className="mr-1.5 h-3.5 w-3.5" />
              Import from Library
            </Button>
          </div>
        </div>
      ) : (
        <CharacterGrid
          characters={characters}
          approvedRefs={approvedCharacterRefs}
          style={style}
          bookProfile={bookProfile ?? undefined}
          storyId={storyId ?? undefined}
          onUpdateCharacter={handleUpdateCharacter}
          onRemoveCharacter={handleRemoveCharacter}
          onApproveCharacter={addApprovedCharacterRef}
        />
      )}

      {characters.length > 0 && !allApproved && (
        <p className="text-sm text-amber-600">
          Generate and approve a portrait for each character to continue, or skip to use text-only generation.
        </p>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push('/generate/style')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => router.push('/generate/result')}
          >
            <SkipForward className="mr-1.5 h-3.5 w-3.5" />
            Skip
          </Button>
          <Button
            disabled={!allApproved}
            onClick={() => router.push('/generate/result')}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <CharacterLibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onImport={handleImportFromLibrary}
        excludeNames={characters.map(c => c.name)}
      />
    </div>
  )
}
