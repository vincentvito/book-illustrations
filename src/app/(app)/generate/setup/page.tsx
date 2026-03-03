'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGenerationStore, useHydrationGuard } from '@/stores/generation-store'
import { StyleLibraryPicker } from '@/components/generate/style-library-picker'
import { FormatPicker } from '@/components/generate/format-picker'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { BOOK_GENRES, AGE_RANGES } from '@/types/book-profile'
import type { BookGenre, AgeRange } from '@/types/book-profile'
import { WizardStepper } from '@/components/generate/wizard-stepper'
import { resolveBookProfile } from '@/lib/style-library/resolve-profile'
import { getStyleTemplate } from '@/lib/style-library/templates'

export default function SetupPage() {
  const router = useRouter()
  const hasHydrated = useHydrationGuard()
  const {
    storyId, storyText,
    genre, ageRange, styleTemplateId, bookFormatId,
    setGenre, setAgeRange, setStyleTemplate, setBookFormat,
  } = useGenerationStore()

  useEffect(() => {
    if (!hasHydrated) return
    if (!storyText) { router.push('/upload') }
  }, [hasHydrated, storyText, router])

  if (!hasHydrated || !storyText) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const canContinue = genre && ageRange && styleTemplateId && bookFormatId

  const handleContinue = async () => {
    if (!canContinue) return

    // Persist resolved book_profile to database
    if (storyId && styleTemplateId && genre && ageRange) {
      const template = getStyleTemplate(styleTemplateId)
      if (template) {
        const bookProfile = resolveBookProfile(template, genre, ageRange)
        try {
          await fetch(`/api/stories/${storyId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ book_profile: bookProfile }),
          })
        } catch {
          // Non-blocking — data is still in the store
        }
      }
    }

    router.push('/generate')
  }

  return (
    <div className="space-y-8">
      <WizardStepper />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Set Up Your Book</h1>
        <p className="text-gray-500">Choose your audience and visual style</p>
      </div>

      {/* Genre + Age Range — compact dropdowns */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="genre" className="mb-1.5 block text-sm font-semibold text-gray-700">
            Book Genre
          </label>
          <select
            id="genre"
            value={genre ?? ''}
            onChange={(e) => setGenre(e.target.value as BookGenre)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="" disabled>Select genre...</option>
            {BOOK_GENRES.map(g => (
              <option key={g.id} value={g.id}>{g.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ageRange" className="mb-1.5 block text-sm font-semibold text-gray-700">
            Target Age
          </label>
          <select
            id="ageRange"
            value={ageRange ?? ''}
            onChange={(e) => setAgeRange(e.target.value as AgeRange)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="" disabled>Select age range...</option>
            {AGE_RANGES.map(a => (
              <option key={a.id} value={a.id}>{a.label} — {a.description}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Style Library — the hero */}
      <StyleLibraryPicker selected={styleTemplateId} onSelect={setStyleTemplate} />

      {/* Book Format */}
      <FormatPicker selected={bookFormatId} onSelect={setBookFormat} />

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push('/upload')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button disabled={!canContinue} onClick={handleContinue}>
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
