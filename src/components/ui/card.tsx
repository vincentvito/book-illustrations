import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean
  hoverable?: boolean
}

export function Card({ className = '', selected, hoverable, children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border bg-white p-6 shadow-sm ${
        selected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'
      } ${hoverable ? 'cursor-pointer transition-shadow hover:shadow-md' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
