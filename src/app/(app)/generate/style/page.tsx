'use client'

import { useRouter } from 'next/navigation'
import { useGenerationStore } from '@/stores/generation-store'
import { StylePicker } from '@/components/generate/style-picker'
import { PalettePicker } from '@/components/generate/palette-picker'
import { FormatPicker } from '@/components/generate/format-picker'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { useCredits } from '@/hooks/use-credits'

export default function StylePage() {
  const router = useRouter()
  const {
    selectedSubjects, mode,
    style, palette, customPalettePrompt, bookFormatId,
    setStyle, setPalette, setBookFormat,
  } = useGenerationStore()
  const { credits } = useCredits()

  if (!selectedSubjects.length) {
    router.push('/generate/subjects')
    return null
  }

  const creditsNeeded = mode === 'all' ? selectedSubjects.length : 1
  const canGenerate = style && palette && bookFormatId && (credits ?? 0) >= creditsNeeded

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customize Your Illustration</h1>
        <p className="text-gray-500">Choose style, colors, and book format</p>
      </div>

      <StylePicker selected={style} onSelect={setStyle} />
      <PalettePicker selected={palette} customPrompt={customPalettePrompt} onSelect={setPalette} />
      <FormatPicker selected={bookFormatId} onSelect={setBookFormat} />

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
        <span className="font-medium text-amber-800">Cost: {creditsNeeded} credit{creditsNeeded > 1 ? 's' : ''}</span>
        <span className="text-amber-600"> (you have {credits ?? 0})</span>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push('/generate/subjects')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          disabled={!canGenerate}
          onClick={() => router.push('/generate/result')}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Generate ({creditsNeeded} credit{creditsNeeded > 1 ? 's' : ''})
        </Button>
      </div>
    </div>
  )
}
