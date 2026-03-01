'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGenerationStore } from '@/stores/generation-store'
import { GenerationProgress } from '@/components/generate/generation-progress'
import { ImageResult } from '@/components/generate/image-result'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import type { StylePresetId, PalettePresetId } from '@/lib/prompt-builder'

export default function ResultPage() {
  const router = useRouter()
  const {
    selectedSubjects, style, palette, customPalettePrompt,
    mode, bookFormatId, generatedImages,
    addGeneratedImage, setStatus, status, reset,
  } = useGenerationStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [regenerating, setRegenerating] = useState(false)

  const generateOne = async (subjectIndex: number) => {
    const subject = selectedSubjects[subjectIndex]
    if (!subject || !style || !palette || !bookFormatId) return

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
        }),
      })

      const data = await res.json()

      if (res.ok && data.imageUrl) {
        addGeneratedImage(data.imageUrl, subject.id)
        setStatus('completed')
      } else {
        console.error('Generation failed:', data.error)
        setStatus('error')
      }
    } catch (error) {
      console.error('Generation error:', error)
      setStatus('error')
    }
  }

  useEffect(() => {
    if (!selectedSubjects.length || !style || !palette || !bookFormatId) {
      router.push('/generate/style')
      return
    }

    if (generatedImages.length === 0) {
      generateOne(0)
    }
  }, [])

  useEffect(() => {
    if (
      mode === 'all' &&
      status === 'completed' &&
      generatedImages.length < selectedSubjects.length &&
      generatedImages.length > currentIndex
    ) {
      const nextIndex = generatedImages.length
      setCurrentIndex(nextIndex)
      setTimeout(() => generateOne(nextIndex), 1000)
    }
  }, [generatedImages.length, status])

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

  const handleNewProject = () => {
    reset()
    router.push('/upload')
  }

  const isGenerating = status === 'generating' || status === 'processing'
  const allDone = mode === 'all'
    ? generatedImages.length >= selectedSubjects.length
    : generatedImages.length > 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isGenerating ? 'Generating...' : 'Your Illustration' + (mode === 'all' ? 's' : '')}
        </h1>
        {mode === 'all' && (
          <p className="text-gray-500">
            {generatedImages.length} of {selectedSubjects.length} illustrations
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
              {mode === 'all' && selectedSubjects[i] && (
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

      {allDone && !isGenerating && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/generate/style')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Change Settings
          </Button>
          <Button onClick={handleNewProject}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      )}
    </div>
  )
}
