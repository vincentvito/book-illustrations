'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGenerationStore, useHydrationGuard } from '@/stores/generation-store'
import { CharacterGrid } from '@/components/generate/character-grid'
import { CharacterLibraryModal } from '@/components/generate/character-library-modal'
import { GenerationProgress } from '@/components/generate/generation-progress'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft, Plus, BookOpen, SkipForward, RefreshCw, Loader2 } from 'lucide-react'
import type { Character, CharacterReference } from '@/types/generation'
import { WizardStepper } from '@/components/generate/wizard-stepper'

const EXTRACT_CLIENT_TIMEOUT_MS = 250_000

export default function CharactersPage() {
  const router = useRouter()
  const hasHydrated = useHydrationGuard()
  const {
    storyId, storyText, characters, setCharacters,
    charactersExtracted, setCharactersExtracted,
    approvedCharacterRefs, addApprovedCharacterRef, removeApprovedCharacterRef,
    renameCharacterInSubjects, styleTemplateId, genre, ageRange, mode,
    setStatus, status,
  } = useGenerationStore()

  const [libraryOpen, setLibraryOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCharacters = async () => {
    if (!storyText || !mode) return
    setLoading(true)
    setStatus('analyzing')
    setError(null)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), EXTRACT_CLIENT_TIMEOUT_MS)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyText,
          mode,
          phase: 'characters',
          styleTemplateId: styleTemplateId ?? undefined,
          genre: genre ?? undefined,
          ageRange: ageRange ?? undefined,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        setError(typeof errorData?.error === 'string' ? errorData.error : 'Failed to extract characters. Please try again.')
        setStatus('error')
        return
      }

      const data = await res.json()

      if (data.characters && Array.isArray(data.characters)) {
        setCharactersExtracted(true)
        setCharacters(data.characters)
        setStatus('idle')
      } else {
        setCharactersExtracted(true)
        setCharacters([])
        setStatus('idle')
      }
    } catch (err) {
      console.error('Character extraction error:', err)
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('The analysis timed out. Your story might be very long - try again or shorten it.')
      } else {
        setError('Connection error. Check your internet and try again.')
      }
      setStatus('error')
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!hasHydrated) return
    if (!mode || !styleTemplateId) {
      router.push('/generate/setup')
      return
    }
    // Auto-extract characters if not yet done
    if (!charactersExtracted && characters.length === 0) {
      fetchCharacters()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated])

  const handleUpdateCharacter = (index: number, updated: Character) => {
    const next = [...characters]
    const oldName = next[index].name
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
    const exists = characters.some(c => c.name === ref.characterName)
    if (!exists) {
      setCharacters([...characters, {
        name: ref.characterName,
        appearance: ref.appearanceDescription,
      }])
    }
    addApprovedCharacterRef(ref)
  }

  const allApproved = characters.length > 0 && characters.every(
    c => c.name && approvedCharacterRefs.some(r => r.characterName === c.name)
  )

  if (!hasHydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (loading || status === 'analyzing') {
    return (
      <div className="space-y-8">
        <WizardStepper />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Character Studio</h1>
          <p className="text-gray-500">
            {storyText && storyText.length > 20_000
              ? 'AI is reading your story to identify characters - this may take up to 4 minutes for longer texts...'
              : 'AI is reading your story to identify characters...'}
          </p>
        </div>
        <GenerationProgress status="analyzing" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <WizardStepper />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Character Studio</h1>
          <p className="text-gray-500">Something went wrong while extracting characters.</p>
        </div>
        <div className="flex flex-col items-center gap-4 rounded-xl border border-red-200 bg-red-50 p-8">
          <p className="text-center text-sm font-medium text-red-700">{error}</p>
          <Button onClick={fetchCharacters} loading={loading}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Try Again
          </Button>
        </div>
        <div className="flex justify-start">
          <Button variant="outline" onClick={() => router.push('/generate')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    )
  }

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
          <Button variant="outline" size="sm" onClick={fetchCharacters} loading={loading}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Re-extract
          </Button>
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
            No characters found in the story. Add characters manually or import from your library.
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
          styleTemplateId={styleTemplateId!}
          genre={genre ?? undefined}
          ageRange={ageRange ?? undefined}
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
        <Button variant="outline" onClick={() => router.push('/generate')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => router.push('/generate/subjects')}
          >
            <SkipForward className="mr-1.5 h-3.5 w-3.5" />
            Skip
          </Button>
          <Button
            disabled={!allApproved}
            onClick={() => router.push('/generate/subjects')}
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
