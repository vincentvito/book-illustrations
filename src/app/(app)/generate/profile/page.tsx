'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGenerationStore, useHydrationGuard } from '@/stores/generation-store'
import { BookProfileForm, DEFAULT_PROFILE } from '@/components/generate/book-profile-form'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import type { BookProfile } from '@/types/book-profile'
import { WizardStepper } from '@/components/generate/wizard-stepper'

export default function ProfilePage() {
  const router = useRouter()
  const hasHydrated = useHydrationGuard()
  const { storyId, storyText, bookProfile, setBookProfile } = useGenerationStore()

  const [localProfile, setLocalProfile] = useState<BookProfile>(
    bookProfile ?? DEFAULT_PROFILE
  )

  // Sync local profile once store hydrates
  useEffect(() => {
    if (hasHydrated && bookProfile) {
      setLocalProfile(bookProfile)
    }
  }, [hasHydrated, bookProfile])

  useEffect(() => {
    if (!hasHydrated) return
    if (!storyText) { router.push('/upload') }
  }, [hasHydrated, storyText, router])

  if (!hasHydrated || !storyText) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const handleContinue = async () => {
    setBookProfile(localProfile)

    // Persist to database if story exists
    if (storyId) {
      try {
        await fetch(`/api/stories/${storyId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ book_profile: localProfile }),
        })
      } catch {
        // Non-blocking — profile is still in the store
      }
    }

    router.push('/generate')
  }

  return (
    <div className="space-y-8">
      <WizardStepper />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Book Profile</h1>
        <p className="text-gray-500">
          Tell us about your book so we can tailor the illustrations perfectly.
        </p>
      </div>

      <BookProfileForm profile={localProfile} onChange={setLocalProfile} />

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push('/upload')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleContinue}>
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
