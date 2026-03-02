'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import type { GenerationStatus } from '@/types/generation'

interface GenerationProgressProps {
  status: GenerationStatus
  subjectTitle?: string
  styleName?: string
}

const messages: Record<GenerationStatus, string> = {
  idle: '',
  analyzing: 'Reading your story and suggesting illustrations...',
  generating: 'Creating your illustration with AI...',
  processing: 'Resizing to your book format...',
  completed: 'Done!',
  error: 'Something went wrong.',
}

const tips = [
  'AI is composing your illustration...',
  'Applying your chosen art style...',
  'Adjusting colors to your palette...',
  'Adding fine details...',
  'Balancing composition and layout...',
]

export function GenerationProgress({ status, subjectTitle, styleName }: GenerationProgressProps) {
  const [tipIndex, setTipIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  // Rotate tips every 5 seconds
  useEffect(() => {
    if (status !== 'generating' && status !== 'processing') return
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [status])

  // Faux progress bar — fills over ~40 seconds, slowing as it approaches 90%
  useEffect(() => {
    if (status !== 'generating' && status !== 'processing') {
      setProgress(0)
      return
    }
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev
        // Start fast, slow down as we approach 90%
        const remaining = 90 - prev
        const increment = Math.max(0.5, remaining * 0.04)
        return Math.min(90, prev + increment)
      })
    }, 500)
    return () => clearInterval(interval)
  }, [status])

  if (status === 'idle' || status === 'completed') return null

  return (
    <div className="flex flex-col items-center gap-4 py-12">
      {status !== 'error' && (
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
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
        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
          {styleName}
        </span>
      )}

      {(status === 'generating' || status === 'processing') && (
        <>
          {/* Progress bar */}
          <div className="w-full max-w-xs">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Rotating tip */}
          <p className="h-5 text-xs text-gray-400 transition-opacity duration-300">
            {tips[tipIndex]}
          </p>
        </>
      )}
    </div>
  )
}
