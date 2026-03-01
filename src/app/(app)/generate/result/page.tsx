'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useGenerationStore } from '@/stores/generation-store'
import { GenerationProgress } from '@/components/generate/generation-progress'
import { ImageResult } from '@/components/generate/image-result'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Eye } from 'lucide-react'

export default function ResultPage() {
  const router = useRouter()
  const {
    storyId, bookProfile, selectedSubjects, style, palette, customPalettePrompt,
    mode, bookFormatId, generatedImages,
    addGeneratedImage, setStatus, status, reset,
  } = useGenerationStore()

  const [attemptedCount, setAttemptedCount] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [regenerating, setRegenerating] = useState(false)

  const inFlightRef = useRef<Set<number>>(new Set())

  const generateOne = useCallback(async (subjectIndex: number) => {
    if (inFlightRef.current.has(subjectIndex)) return

    const subject = selectedSubjects[subjectIndex]
    if (!subject || !style || !palette || !bookFormatId) return

    inFlightRef.current.add(subjectIndex)
    setStatus('generating')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.description,
          style,
          palette,
          customPalettePrompt: palette === 'custom' ? customPalettePrompt : undefined,
          mode,
          bookFormatId,
          resolution: '2K',
          storyId: storyId ?? undefined,
          bookProfile: bookProfile ?? undefined,
        }),
      })

      const data = await res.json()

      if (res.ok && data.imageUrl) {
        addGeneratedImage(data.imageUrl, subject.id)
      } else {
        console.error('Generation failed for subject', subjectIndex, ':', data.error)
        setErrorCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Generation error for subject', subjectIndex, ':', error)
      setErrorCount(prev => prev + 1)
    } finally {
      inFlightRef.current.delete(subjectIndex)
      setAttemptedCount(subjectIndex + 1)
      setStatus('completed')
    }
  }, [selectedSubjects, style, palette, customPalettePrompt, mode, bookFormatId, storyId, bookProfile, addGeneratedImage, setStatus])

  const generateOneRef = useRef(generateOne)
  generateOneRef.current = generateOne

  // Initial generation on mount
  useEffect(() => {
    if (!selectedSubjects.length || !style || !palette || !bookFormatId) {
      router.push('/generate/style')
      return
    }

    if (attemptedCount === 0 && !inFlightRef.current.has(0)) {
      generateOne(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sequential loop: after each completion, schedule the next subject
  useEffect(() => {
    if (
      mode !== 'all' ||
      status !== 'completed' ||
      attemptedCount >= selectedSubjects.length
    ) {
      return
    }

    const nextIndex = attemptedCount
    const timer = setTimeout(() => {
      generateOneRef.current(nextIndex)
    }, 1000)

    return () => clearTimeout(timer)
  }, [mode, status, attemptedCount, selectedSubjects.length])

  const handleRegenerate = async () => {
    setRegenerating(true)
    const lastSubject = selectedSubjects[generatedImages.length - 1] || selectedSubjects[0]

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: lastSubject.description,
          style,
          palette,
          customPalettePrompt: palette === 'custom' ? customPalettePrompt : undefined,
          mode,
          bookFormatId,
          resolution: '2K',
          storyId: storyId ?? undefined,
          bookProfile: bookProfile ?? undefined,
        }),
      })

      const data = await res.json()
      if (res.ok && data.imageUrl) {
        addGeneratedImage(data.imageUrl, lastSubject.id)
      }
    } catch (error) {
      console.error('Regenerate error:', error)
    } finally {
      setRegenerating(false)
    }
  }

  const handleViewStory = () => {
    if (storyId) {
      router.push(`/dashboard/${storyId}`)
    } else {
      router.push('/dashboard')
    }
  }

  const handleNewProject = () => {
    reset()
    router.push('/upload')
  }

  const isGenerating = status === 'generating' || status === 'processing'
  const allDone = mode === 'all'
    ? attemptedCount >= selectedSubjects.length
    : generatedImages.length > 0 && !isGenerating

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isGenerating ? 'Generating...' : 'Your Illustration' + (mode === 'all' ? 's' : '')}
        </h1>
        {mode === 'all' && (
          <p className="text-gray-500">
            {attemptedCount} of {selectedSubjects.length} illustrations
          </p>
        )}
      </div>

      {isGenerating && generatedImages.length === 0 && (
        <GenerationProgress status={status} />
      )}

      {generatedImages.length > 0 && (
        <div className="space-y-6">
          {generatedImages.map((img, i) => (
            <div key={i}>
              {mode === 'all' && (
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  {i + 1}. {selectedSubjects.find(s => s.id === img.subjectId)?.title || `Illustration ${i + 1}`}
                </h3>
              )}
              <ImageResult
                imageUrl={img.url}
                bookFormatId={bookFormatId!}
                onRegenerate={handleRegenerate}
                regenerating={regenerating}
              />
            </div>
          ))}
        </div>
      )}

      {isGenerating && generatedImages.length > 0 && (
        <GenerationProgress status={status} />
      )}

      {allDone && errorCount > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            {errorCount} illustration{errorCount !== 1 ? 's' : ''} could not be generated.
          </p>
        </div>
      )}

      {allDone && !isGenerating && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/generate/style')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Change Settings
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleViewStory}>
              <Eye className="mr-2 h-4 w-4" />
              View Story
            </Button>
            <Button onClick={handleNewProject}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
