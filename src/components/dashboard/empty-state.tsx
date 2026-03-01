'use client'

import { useRouter } from 'next/navigation'
import { BookOpen, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmptyState() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16 px-6 text-center">
      <BookOpen className="mb-4 h-12 w-12 text-gray-300" />
      <h3 className="mb-1 text-lg font-semibold text-gray-900">No stories yet</h3>
      <p className="mb-6 max-w-sm text-sm text-gray-500">
        Upload or paste your story to start generating beautiful illustrations
      </p>
      <Button onClick={() => router.push('/upload')}>
        <Plus className="mr-2 h-4 w-4" />
        Create Your First Story
      </Button>
    </div>
  )
}
