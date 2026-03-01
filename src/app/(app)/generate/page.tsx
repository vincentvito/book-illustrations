'use client'

import { useRouter } from 'next/navigation'
import { useGenerationStore } from '@/stores/generation-store'
import { ModeSelector } from '@/components/generate/mode-selector'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft } from 'lucide-react'

export default function GeneratePage() {
  const router = useRouter()
  const { storyText, bookProfile, mode, setMode } = useGenerationStore()

  if (!storyText) {
    router.push('/upload')
    return null
  }

  if (!bookProfile) {
    router.push('/generate/profile')
    return null
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Choose Generation Mode</h1>
        <p className="text-gray-500">What kind of illustration do you need?</p>
      </div>

      <ModeSelector selected={mode} onSelect={setMode} />

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push('/generate/profile')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button disabled={!mode} onClick={() => router.push('/generate/subjects')}>
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
