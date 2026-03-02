import { Suspense } from 'react'
import { CreditBalance } from '@/components/credits/credit-balance'
import { CreditPackages } from '@/components/credits/credit-packages'

export default function CreditsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Credits</h1>
        <p className="text-gray-500">Purchase credits to generate illustrations</p>
      </div>

      <CreditBalance />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Buy Credits</h2>
        <Suspense fallback={<div className="grid gap-4 sm:grid-cols-3">{[1,2,3].map(i => <div key={i} className="h-48 animate-pulse rounded-xl bg-gray-100" />)}</div>}>
          <CreditPackages />
        </Suspense>
      </div>
    </div>
  )
}
