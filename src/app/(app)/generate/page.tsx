'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGenerationStore } from '@/stores/generation-store'
import { ModeSelector } from '@/components/generate/mode-selector'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { WizardStepper } from '@/components/generate/wizard-stepper'

export default function GeneratePage() {
  const router = useRouter()
  const { _hasHydrated, storyText, bookProfile, mode, setMode } = useGenerationStore()

  useEffect(() => {
    if (!_hasHydrated) return
    if (!storyText) { router.push('/upload'); return }
    if (!bookProfile) { router.push('/generate/profile'); return }
  }, [_hasHydrated, storyText, bookProfile, router])

  if (!_hasHydrated || !storyText || !bookProfile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <WizardStepper />

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
