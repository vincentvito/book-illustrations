'use client'

import { useState, useEffect } from 'react'
import { Loader2, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { GenerationStatus } from '@/types/generation'

interface GenerationProgressProps {
  status: GenerationStatus
  subjectTitle?: string
  styleName?: string
  onStop?: () => void
}

const messages: Record<GenerationStatus, string> = {
  idle: '',
  analyzing: 'Reading your story and suggesting illustrations...',
  generating: 'Creating your illustration with AI...',
  processing: 'Resizing to your book format...',
  completed: 'Done!',
  error: 'Something went wrong.',
}

const analysisTips = [
  'Reading through your story...',
  'Identifying key characters...',
  'Finding the most visual scenes...',
  'Crafting detailed scene descriptions...',
  'Selecting the best illustration moments...',
]

const generationTips = [
  'AI is composing your illustration...',
  'Applying your chosen art style...',
  'Adjusting colors to your palette...',
  'Adding fine details...',
  'Balancing composition and layout...',
]

export function GenerationProgress({ status, subjectTitle, styleName, onStop }: GenerationProgressProps) {
  const [tipIndex, setTipIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  const tips = status === 'analyzing' ? analysisTips : generationTips

  // Rotate tips every 5 seconds
  useEffect(() => {
    if (status !== 'analyzing' && status !== 'generating' && status !== 'processing') return
    setTipIndex(0)
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % (status === 'analyzing' ? analysisTips.length : generationTips.length))
    }, 5000)
    return () => clearInterval(interval)
  }, [status])

  // Faux progress bar — fills gradually, slowing as it approaches 90%
  useEffect(() => {
    if (status !== 'analyzing' && status !== 'generating' && status !== 'processing') {
      setProgress(0)
      return
    }
    setProgress(0)
    // Slower rate for analyzing (~90s to fill) vs generating (~40s)
    const rate = status === 'analyzing' ? 0.018 : 0.04
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        const remaining = 90 - prev
        const increment = Math.max(0.3, remaining * rate)
        return Math.min(90, prev + increment)
      })
    }, 500)
    return () => clearInterval(interval)
  }, [status])

  if (status === 'idle' || status === 'completed') return null

  return (
    <div className="flex flex-col items-center gap-4 py-12">
      {status !== 'error' && (
        <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
      )}

      <p className={`text-sm font-medium ${
        status === 'error' ? 'text-red-600' : 'text-gray-600'
      }`}>
        {messages[status]}
      </p>

      {subjectTitle && status === 'generating' && (
        <p className="text-sm text-gray-700">
          Generating: <span className="font-medium">{subjectTitle}</span>
        </p>
      )}

      {styleName && status === 'generating' && (
        <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700">
          {styleName}
        </span>
      )}

      {(status === 'analyzing' || status === 'generating' || status === 'processing') && (
        <>
          {/* Progress bar */}
          <div className="w-full max-w-xs">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-orange-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Rotating tip */}
          <p className="h-5 text-xs text-gray-400 transition-opacity duration-300">
            {tips[tipIndex]}
          </p>

          {/* Stop button */}
          {onStop && (status === 'generating' || status === 'processing') && (
            <Button
              variant="outline"
              size="sm"
              onClick={onStop}
              className="mt-2"
            >
              <Square className="mr-1.5 h-3 w-3 fill-current" />
              Stop Generation
            </Button>
          )}
        </>
      )}
    </div>
  )
}
