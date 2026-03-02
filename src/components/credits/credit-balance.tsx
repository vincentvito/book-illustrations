'use client'

import { Coins } from 'lucide-react'
import { useCredits } from '@/hooks/use-credits'

export function CreditBalance() {
  const { credits, loading } = useCredits()

  return (
    <div className="flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
        <Coins className="h-5 w-5 text-orange-600" />
      </div>
      <div>
        <p className="text-sm text-orange-600">Your Balance</p>
        <p className="text-2xl font-bold text-orange-900">
          {loading ? '...' : credits}
          <span className="ml-1 text-sm font-normal text-orange-600">credits</span>
        </p>
      </div>
    </div>
  )
}
