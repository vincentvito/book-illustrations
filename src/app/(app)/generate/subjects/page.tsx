'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGenerationStore, useHydrationGuard } from '@/stores/generation-store'
import { SubjectGrid } from '@/components/generate/subject-grid'
import { GenerationProgress } from '@/components/generate/generation-progress'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft, RefreshCw, Sparkles, Loader2 } from 'lucide-react'
import type { Subject } from '@/types/generation'
import { WizardStepper } from '@/components/generate/wizard-stepper'
import { useCredits } from '@/hooks/use-credits'

const ANALYZE_CLIENT_TIMEOUT_MS = 250_000
const ANALYZE_TIMEOUT_MESSAGE = 'The analysis timed out. Your story might be very long - try again or shorten it.'

type AnalyzeErrorPayload = {
  error?: unknown
  code?: unknown
  requestId?: unknown
}

function buildAnalyzeErrorMessage(status: number, payload: AnalyzeErrorPayload | null): string {
  const isTimeout = status === 504 || status === 408 || payload?.code === 'ANALYZE_TIMEOUT'
  if (isTimeout) {
    return typeof payload?.requestId === 'string'
      ? `${ANALYZE_TIMEOUT_MESSAGE} Reference ID: ${payload.requestId}.`
      : ANALYZE_TIMEOUT_MESSAGE
  }
  if (typeof payload?.error === 'string' && payload.error.length > 0) {
    return payload.error
  }
  return 'Failed to analyze story. Please try again.'
}

export default function SubjectsPage() {
  const router = useRouter()
  const hasHydrated = useHydrationGuard()
  const {
    storyText, styleTemplateId, genre, ageRange, mode, characters,
    subjects, selectedSubjects,
    setSubjects, setCharacters, selectSubject, deselectSubject, replaceSubject, setStatus, status
  } = useGenerationStore()
  const { credits } = useCredits()
  const [regeneratingId, setRegeneratingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSubjects = async () => {
    if (!storyText || !mode) return
    setLoading(true)
    setStatus('analyzing')
    setError(null)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), ANALYZE_CLIENT_TIMEOUT_MS)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyText,
          mode,
          styleTemplateId: styleTemplateId ?? undefined,
          genre: genre ?? undefined,
          ageRange: ageRange ?? undefined,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null) as AnalyzeErrorPayload | null
        const errorMessage = buildAnalyzeErrorMessage(res.status, errorData)
        setError(errorMessage)
        setStatus('error')
        return
      }

      const data = await res.json()

      if (data.subjects && Array.isArray(data.subjects) && data.subjects.length > 0) {
        if (data.characters && Array.isArray(data.characters)) {
          setCharacters(data.characters)
        }
        setSubjects(data.subjects)
        setStatus('idle')
      } else {
        setError('The AI returned no suggestions. Please try again.')
        setStatus('error')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      if (error instanceof DOMException && error.name === 'AbortError') {
        setError(ANALYZE_TIMEOUT_MESSAGE)
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
    if (!storyText || !mode) {
      router.push('/generate')
      return
    }
    if (subjects.length === 0) {
      fetchSubjects()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated])

  const handleRegenerate = async (subjectId: number) => {
    if (!storyText || !mode) return
    setRegeneratingId(subjectId)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyText,
          mode,
          styleTemplateId: styleTemplateId ?? undefined,
          genre: genre ?? undefined,
          ageRange: ageRange ?? undefined,
        }),
      })

      if (!res.ok) {
        console.error('Regenerate failed with status:', res.status)
        return
      }

      const data = await res.json()

      if (data.subjects && Array.isArray(data.subjects)) {
        const newSubject = data.subjects.find((s: Subject) => s.id === subjectId) || data.subjects[0]
        if (newSubject) {
          replaceSubject(subjectId, { ...newSubject, id: subjectId })
        }
      }
    } catch (error) {
      console.error('Regenerate error:', error)
    } finally {
      setRegeneratingId(null)
    }
  }

  const handleSelect = (subject: Subject) => {
    const isSelected = selectedSubjects.some(s => s.id === subject.id)
    if (isSelected) {
      deselectSubject(subject.id)
    } else {
      selectSubject(subject)
    }
  }

  const creditsNeeded = mode === 'all' ? selectedSubjects.length : 1
  const hasEnoughCredits = (credits ?? 0) >= creditsNeeded

  const canContinue = mode === 'all'
    ? selectedSubjects.length > 0 && hasEnoughCredits
    : selectedSubjects.length === 1 && hasEnoughCredits

  const handleContinue = () => {
    if (mode === 'all' && characters.length > 0) {
      router.push('/generate/characters')
    } else {
      router.push('/generate/result')
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Suggested Subjects</h1>
          <p className="text-gray-500">
            {storyText && storyText.length > 20_000
              ? 'AI is reading your story - this may take up to 4 minutes for longer texts...'
              : 'AI is reading your story...'}
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
          <h1 className="text-2xl font-bold text-gray-900">Suggested Subjects</h1>
          <p className="text-gray-500">Something went wrong while analyzing your story.</p>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-xl border border-red-200 bg-red-50 p-8">
          <p className="text-center text-sm font-medium text-red-700">{error}</p>
          <Button onClick={fetchSubjects} loading={loading}>
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
    <div className="space-y-8">
      <WizardStepper />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Choose Your Subject{mode === 'all' ? 's' : ''}</h1>
          <p className="text-gray-500">
            {mode === 'all'
              ? 'Select the illustrations you want to generate'
              : 'Pick one subject for your illustration'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSubjects} loading={loading}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Regenerate All
        </Button>
      </div>

      <SubjectGrid
        subjects={subjects}
        selectedIds={selectedSubjects.map(s => s.id)}
        onSelect={handleSelect}
        onRegenerate={handleRegenerate}
        regeneratingId={regeneratingId}
      />

      {selectedSubjects.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
          <span className="font-medium text-amber-800">Cost: {creditsNeeded} credit{creditsNeeded > 1 ? 's' : ''}</span>
          <span className="text-amber-600"> (you have {credits ?? 0})</span>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push('/generate')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {mode === 'all' && characters.length > 0 ? (
          <Button disabled={!canContinue} onClick={handleContinue}>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button disabled={!canContinue} onClick={handleContinue}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate ({creditsNeeded} credit{creditsNeeded > 1 ? 's' : ''})
          </Button>
        )}
      </div>
    </div>
  )
}
