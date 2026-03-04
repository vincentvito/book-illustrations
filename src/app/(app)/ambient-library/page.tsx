'use client'

import { useEffect, useState } from 'react'
import { Trash2, Image } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { EnvironmentReference } from '@/types/generation'

export default function AmbientLibraryPage() {
  const [ambients, setAmbients] = useState<EnvironmentReference[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchAmbients = () => {
    setLoading(true)
    fetch('/api/ambients/library')
      .then((res) => res.json())
      .then((data) => setAmbients(data.ambients ?? []))
      .catch(() => setAmbients([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAmbients()
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/ambients/library/${deleteTarget}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setAmbients((prev) => prev.filter((a) => a.id !== deleteTarget))
        toast.success('Environment deleted')
      } else {
        toast.error('Failed to delete environment')
      }
    } catch {
      toast.error('Failed to delete environment')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ambient Library</h1>
        <p className="text-gray-500">
          Your saved environment references for reuse across stories
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-gray-200 bg-white"
            >
              <div className="aspect-[16/9] rounded-t-xl bg-gray-100" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-2/3 rounded bg-gray-100" />
                <div className="h-3 w-full rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : ambients.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-gray-300 p-12">
          <Image className="h-12 w-12 text-gray-300" />
          <div className="text-center">
            <p className="font-medium text-gray-900">No environments yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Environments you save during the illustration process will appear
              here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ambients.map((ambient) => (
            <div
              key={ambient.id}
              className="group overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                <img
                  src={ambient.referenceImageUrl}
                  alt={ambient.environmentName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-gray-900">
                      {ambient.environmentName}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {ambient.environmentDescription}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(ambient.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete environment?"
        description="This will permanently remove this environment from your library."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  )
}
