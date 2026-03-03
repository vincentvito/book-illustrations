'use client'

import { useState, useRef, useEffect, useLayoutEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface DropdownMenuProps {
  trigger: ReactNode
  children: ReactNode
  align?: 'left' | 'right'
}

export function DropdownMenu({ trigger, children, align = 'right' }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + 4,
        left: align === 'right' ? rect.right - 160 : rect.left,
      })
    }
  }, [open, align])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !menuRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return (
    <div ref={triggerRef} onClick={() => setOpen(o => !o)}>
      {trigger}
      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: coords.top, left: coords.left }}
            className="fixed z-[100] min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          >
            <div onClick={() => setOpen(false)}>{children}</div>
          </div>,
          document.body
        )}
    </div>
  )
}

interface DropdownItemProps {
  onClick: () => void
  variant?: 'default' | 'danger'
  children: ReactNode
}

export function DropdownItem({ onClick, variant = 'default', children }: DropdownItemProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${
        variant === 'danger'
          ? 'text-red-600 hover:bg-red-50'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}
