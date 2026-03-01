'use client'

import { FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StoryPreviewProps {
  text: string
  filename?: string | null
  onClear: () => void
}

export function StoryPreview({ text, filename, onClear }: StoryPreviewProps) {
  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            {filename ?? 'Pasted text'}
          </span>
          <span className="text-xs text-green-600">
            ({text.length.toLocaleString()} chars)
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="line-clamp-4 text-sm text-green-700">{text}</p>
    </div>
  )
}
