'use client'

import { useState } from 'react'
import { Download, RefreshCw, Pencil, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ImageResultProps {
  imageUrl: string
  bookFormatId: string
  onRegenerate: (editInstructions?: string, currentImageUrl?: string) => void
  regenerating?: boolean
}

export function ImageResult({ imageUrl, bookFormatId, onRegenerate, regenerating }: ImageResultProps) {
  const [downloading, setDownloading] = useState(false)
  const [editInstructions, setEditInstructions] = useState('')
  const [showEditPanel, setShowEditPanel] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      // Images are already at exact book format dimensions after generation-time processing.
      const res = await fetch(imageUrl)
      if (!res.ok) throw new Error('Download failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `illustration-${bookFormatId}.png`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Illustration downloaded!')
    } catch {
      toast.error('Download failed. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const handleRegenerate = () => {
    const instructions = editInstructions.trim() || undefined
    // Pass the current image URL so the model can use it as a visual reference
    onRegenerate(instructions, instructions ? imageUrl : undefined)
    setEditInstructions('')
    setShowEditPanel(false)
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-lg">
        <img
          src={imageUrl}
          alt="Generated illustration"
          className="w-full"
        />
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowEditPanel(!showEditPanel)}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit & Regenerate
          {showEditPanel ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showEditPanel && (
          <div className="mt-2 space-y-2">
            <Textarea
              value={editInstructions}
              onChange={(e) => setEditInstructions(e.target.value)}
              placeholder="Describe changes... e.g. 'make the sky more blue', 'add more trees in the background'"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-400">{editInstructions.length}/500</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button onClick={handleDownload} loading={downloading} className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Download (Book Format)
        </Button>
        <Button variant="outline" onClick={handleRegenerate} loading={regenerating}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {editInstructions.trim() ? 'Apply Edits' : 'Regenerate'}
        </Button>
      </div>
    </div>
  )
}
