'use client'

import { Loader2 } from 'lucide-react'
import type { GenerationStatus } from '@/types/generation'

interface GenerationProgressProps {
  status: GenerationStatus
}

const messages: Record<GenerationStatus, string> = {
  idle: '',
  analyzing: 'Reading your story and suggesting illustrations...',
  generating: 'Creating your illustration with AI...',
  processing: 'Resizing to your book format...',
  completed: 'Done!',
  error: 'Something went wrong.',
}

export function GenerationProgress({ status }: GenerationProgressProps) {
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
      {status === 'generating' && (
        <p className="text-xs text-gray-400">This may take 15-45 seconds</p>
      )}
    </div>
  )
}
