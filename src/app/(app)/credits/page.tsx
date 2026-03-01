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
        <CreditPackages />
      </div>
    </div>
  )
}
