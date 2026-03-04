'use client'

import { useState } from 'react'
import { BookOpen, Menu, X } from 'lucide-react'
import { Sidebar } from './sidebar'

export function MobileHeader() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Top bar - mobile only */}
      <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-orange-600" />
          <span className="font-bold text-gray-900">Book Illustrator</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Slide-over drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <div className="relative">
              <Sidebar />
              <button
                onClick={() => setOpen(false)}
                className="absolute right-2 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
