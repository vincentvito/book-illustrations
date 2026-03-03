import type { HTMLAttributes, KeyboardEvent } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean
  hoverable?: boolean
}

export function Card({ className = '', selected, hoverable, children, onClick, ...props }: CardProps) {
  const isInteractive = hoverable && onClick

  const handleKeyDown = isInteractive
    ? (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(e as unknown as React.MouseEvent<HTMLDivElement>)
        }
      }
    : undefined

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`rounded-xl border bg-white p-6 shadow-sm ${
        selected ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200'
      } ${hoverable ? 'cursor-pointer transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
