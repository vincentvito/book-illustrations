'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BookOpen, Plus, Coins, LogOut, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCredits } from '@/hooks/use-credits'
import { useStories } from '@/hooks/use-stories'
import { Button } from '@/components/ui/button'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { credits, loading: creditsLoading } = useCredits()
  const { stories, loading: storiesLoading } = useStories()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const handleNewStory = () => {
    router.push('/upload')
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-5">
        <BookOpen className="h-6 w-6 text-orange-600" />
        <span className="text-lg font-bold text-gray-900">Book Illustrator</span>
      </div>

      {/* New Story Button */}
      <div className="p-4">
        <Button onClick={handleNewStory} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          New Story
        </Button>
      </div>

      {/* Story List */}
      <div className="flex-1 overflow-y-auto px-3">
        <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-gray-400">
          Your Stories
        </p>
        {storiesLoading ? (
          <div className="space-y-2 px-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : stories.length === 0 ? (
          <p className="px-2 text-sm text-gray-400">No stories yet</p>
        ) : (
          <nav className="space-y-1">
            {stories.map(story => {
              const isActive = pathname === `/dashboard/${story.id}`
              return (
                <Link
                  key={story.id}
                  href={`/dashboard/${story.id}`}
                  className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
                    isActive
                      ? 'border-l-2 border-orange-600 bg-orange-50 font-medium text-orange-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FileText className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-orange-600' : 'text-gray-400'}`} />
                  <span className="truncate">{story.title}</span>
                  {story.generation_count > 0 && (
                    <span className={`ml-auto flex-shrink-0 text-xs ${isActive ? 'text-orange-500' : 'text-gray-400'}`}>
                      {story.generation_count}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 space-y-3">
        <Link
          href="/credits"
          className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-700 hover:bg-orange-100 transition-colors"
        >
          <Coins className="h-4 w-4" />
          {creditsLoading ? '...' : `${credits} credits`}
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </div>
  )
}
