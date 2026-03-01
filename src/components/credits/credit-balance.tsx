'use client'

import { Coins } from 'lucide-react'
import { useCredits } from '@/hooks/use-credits'

export function CreditBalance() {
  const { credits, loading } = useCredits()

  return (
    <div className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
        <Coins className="h-5 w-5 text-indigo-600" />
      </div>
      <div>
        <p className="text-sm text-indigo-600">Your Balance</p>
        <p className="text-2xl font-bold text-indigo-900">
          {loading ? '...' : credits}
          <span className="ml-1 text-sm font-normal text-indigo-600">credits</span>
        </p>
      </div>
    </div>
  )
}
