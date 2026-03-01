'use client'

import { useRouter } from 'next/navigation'
import { Upload, Sparkles, Coins } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { CreditBalance } from '@/components/credits/credit-balance'

export default function DashboardPage() {
  const router = useRouter()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Create beautiful illustrations for your book</p>
      </div>

      <CreditBalance />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card hoverable onClick={() => router.push('/upload')} className="group">
          <Upload className="mb-3 h-8 w-8 text-indigo-500 transition-transform group-hover:scale-110" />
          <h3 className="mb-1 font-semibold text-gray-900">New Project</h3>
          <p className="text-sm text-gray-500">
            Upload or paste your story to generate illustrations
          </p>
        </Card>

        <Card hoverable onClick={() => router.push('/credits')} className="group">
          <Coins className="mb-3 h-8 w-8 text-amber-500 transition-transform group-hover:scale-110" />
          <h3 className="mb-1 font-semibold text-gray-900">Buy Credits</h3>
          <p className="text-sm text-gray-500">
            Purchase credits to generate more illustrations
          </p>
        </Card>
      </div>
    </div>
  )
}
