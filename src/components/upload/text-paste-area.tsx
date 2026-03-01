'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface TextPasteAreaProps {
  onTextSubmit: (text: string) => void
}

export function TextPasteArea({ onTextSubmit }: TextPasteAreaProps) {
  const [text, setText] = useState('')

  return (
    <div className="space-y-3">
      <Textarea
        label="Or paste your story text"
        placeholder="Paste your story text here..."
        rows={8}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {text.length.toLocaleString()} characters
        </span>
        <Button
          size="sm"
          disabled={text.length < 50}
          onClick={() => onTextSubmit(text.slice(0, 50_000))}
        >
          Use this text
        </Button>
      </div>
    </div>
  )
}
