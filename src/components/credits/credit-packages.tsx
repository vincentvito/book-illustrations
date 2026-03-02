'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { CREDIT_PACKAGES } from '@/lib/stripe/config'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'

export function CreditPackages() {
  const [loading, setLoading] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Credits purchased successfully!')
      window.history.replaceState({}, '', '/credits')
    }
    if (searchParams.get('canceled') === 'true') {
      toast.info('Purchase canceled')
      window.history.replaceState({}, '', '/credits')
    }
  }, [searchParams])

  const handlePurchase = async (packageId: string) => {
    setLoading(packageId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      toast.error('Failed to start checkout. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {CREDIT_PACKAGES.map((pack) => (
        <Card
          key={pack.id}
          className={`text-center ${pack.popular ? 'relative border-indigo-500 ring-2 ring-indigo-200' : ''}`}
        >
          {pack.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
                <Star className="h-3 w-3" /> Popular
              </span>
            </div>
          )}
          <h3 className="mb-1 text-lg font-bold text-gray-900">{pack.name}</h3>
          <p className="mb-4 text-3xl font-bold text-indigo-600">
            ${(pack.priceInCents / 100).toFixed(2)}
          </p>
          <p className="mb-4 text-sm text-gray-500">
            ${(pack.priceInCents / 100 / pack.credits).toFixed(2)} per credit
          </p>
          <Button
            className="w-full"
            variant={pack.popular ? 'primary' : 'outline'}
            loading={loading === pack.id}
            onClick={() => handlePurchase(pack.id)}
          >
            Buy {pack.name}
          </Button>
        </Card>
      ))}
    </div>
  )
}
