'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { EnvironmentReference } from '@/types/generation'

interface AmbientLibraryModalProps {
  open: boolean
  onClose: () => void
  onImport: (ambient: EnvironmentReference) => void
  excludeNames: string[]
}

export function AmbientLibraryModal({
  open,
  onClose,
  onImport,
  excludeNames,
}: AmbientLibraryModalProps) {
  const [ambients, setAmbients] = useState<EnvironmentReference[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch('/api/ambients/library')
      .then(res => res.json())
      .then(data => setAmbients(data.ambients ?? []))
      .catch(() => setAmbients([]))
      .finally(() => setLoading(false))
  }, [open])

  if (!open) return null

  const available = ambients.filter(
    a => !excludeNames.includes(a.environmentName)
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative mx-4 max-h-[80vh] w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold text-gray-900">Ambient Library</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(80vh - 56px)' }}>
          {loading && (
            <div className="flex justify-center py-8">
              <svg className="h-6 w-6 animate-spin text-orange-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}

          {!loading && available.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500">
              {ambients.length === 0
                ? 'No environments in your library yet.'
                : 'All library environments are already in this story.'}
            </p>
          )}

          {!loading && available.length > 0 && (
            <div className="space-y-3">
              {available.map((ambient) => (
                <div
                  key={ambient.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
                >
                  <img
                    src={ambient.referenceImageUrl}
                    alt={ambient.environmentName}
                    className="h-12 w-20 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {ambient.environmentName}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {ambient.environmentDescription}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onImport(ambient)
                      onClose()
                    }}
                  >
                    Import
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
