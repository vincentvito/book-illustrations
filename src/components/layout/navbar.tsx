'use client'

import Link from 'next/link'
import { BookOpen, LogOut, Coins } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCredits } from '@/hooks/use-credits'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const { credits, loading } = useCredits()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-orange-600" />
          <span className="text-lg font-bold text-gray-900">Book Illustrator</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/credits"
            className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-700 hover:bg-orange-100"
          >
            <Coins className="h-4 w-4" />
            {loading ? '...' : `${credits} credits`}
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-1.5 h-4 w-4" />
            Log out
          </Button>
        </div>
      </div>
    </nav>
  )
}
