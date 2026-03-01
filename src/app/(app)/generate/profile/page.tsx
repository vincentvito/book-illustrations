'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGenerationStore } from '@/stores/generation-store'
import { BookProfileForm, DEFAULT_PROFILE } from '@/components/generate/book-profile-form'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import type { BookProfile } from '@/types/book-profile'

export default function ProfilePage() {
  const router = useRouter()
  const { storyId, storyText, bookProfile, setBookProfile } = useGenerationStore()

  const [localProfile, setLocalProfile] = useState<BookProfile>(
    bookProfile ?? DEFAULT_PROFILE
  )

  if (!storyText) {
    router.push('/upload')
    return null
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
