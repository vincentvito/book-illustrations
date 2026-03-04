'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  Home,
  FilePlus,
  CreditCard,
  Settings,
  Users,
  Image,
  LogOut,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCredits } from '@/hooks/use-credits'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'New Book', href: '/upload', icon: FilePlus },
  { label: 'Credits', href: '/credits', icon: CreditCard },
  { label: 'Account Settings', href: '/account-settings', icon: Settings },
  { label: 'Character Library', href: '/character-library', icon: Users },
  { label: 'Ambient Library', href: '/ambient-library', icon: Image },
]

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const { credits, loading: creditsLoading } = useCredits()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-5">
        <BookOpen className="h-6 w-6 text-orange-600" />
        <span className="text-lg font-bold text-gray-900">Book Illustrator</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard' || pathname.startsWith('/dashboard/')
              : pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              <span>{item.label}</span>
              {item.href === '/credits' && (
                <span
                  className={`ml-auto text-xs ${
                    isActive ? 'text-gray-300' : 'text-gray-400'
                  }`}
                >
                  {creditsLoading ? '...' : credits}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </div>
    </div>
  )
}
