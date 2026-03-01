'use client'

import { useState } from 'react'
import { Download, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageResultProps {
  imageUrl: string
  bookFormatId: string
  onRegenerate: () => void
  regenerating?: boolean
}

export function ImageResult({ imageUrl, bookFormatId, onRegenerate, regenerating }: ImageResultProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, bookFormatId, fit: 'cover' }),
      })

      if (!res.ok) throw new Error('Download failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `illustration-${bookFormatId}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
    } finally {
      setDownloading(false)
    }
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
      <div className="flex gap-3">
        <Button onClick={handleDownload} loading={downloading} className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Download (Book Format)
        </Button>
        <Button variant="outline" onClick={onRegenerate} loading={regenerating}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Regenerate
        </Button>
      </div>
    </div>
  )
}
