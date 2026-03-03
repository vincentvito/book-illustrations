'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStories } from '@/hooks/use-stories'
import { StoryCard } from '@/components/dashboard/story-card'
import { EmptyState } from '@/components/dashboard/empty-state'

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { stories, loading } = useStories()

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      toast.success('Payment successful! Credits have been added to your account.')
      router.replace('/dashboard', { scroll: false })
    }
  }, [searchParams, router])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Stories</h1>
          <p className="text-gray-500">Manage your illustrated stories</p>
        </div>
        <Button onClick={() => router.push('/upload')} className="md:hidden">
          <Plus className="mr-2 h-4 w-4" />
          New Story
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white">
              <div className="aspect-[16/9] bg-gray-100 rounded-t-xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-2/3 rounded bg-gray-100" />
                <div className="h-3 w-1/3 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : stories.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map(story => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  )
}
