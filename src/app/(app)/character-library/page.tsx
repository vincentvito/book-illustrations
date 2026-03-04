'use client'

import { useEffect, useState } from 'react'
import { Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { CharacterReference } from '@/types/generation'

export default function CharacterLibraryPage() {
  const [characters, setCharacters] = useState<CharacterReference[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchCharacters = () => {
    setLoading(true)
    fetch('/api/characters/library')
      .then((res) => res.json())
      .then((data) => setCharacters(data.characters ?? []))
      .catch(() => setCharacters([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCharacters()
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/characters/library/${deleteTarget}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setCharacters((prev) => prev.filter((c) => c.id !== deleteTarget))
        toast.success('Character deleted')
      } else {
        toast.error('Failed to delete character')
      }
    } catch {
      toast.error('Failed to delete character')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Character Library</h1>
        <p className="text-gray-500">
          Your saved character references for reuse across stories
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-gray-200 bg-white"
            >
              <div className="aspect-[3/4] rounded-t-xl bg-gray-100" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-2/3 rounded bg-gray-100" />
                <div className="h-3 w-full rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : characters.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-gray-300 p-12">
          <Users className="h-12 w-12 text-gray-300" />
          <div className="text-center">
            <p className="font-medium text-gray-900">No characters yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Characters you save during the illustration process will appear
              here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((char) => (
            <div
              key={char.id}
              className="group overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                <img
                  src={char.referenceImageUrl}
                  alt={char.characterName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-gray-900">
                      {char.characterName}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {char.appearanceDescription}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(char.id)}
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
        title="Delete character?"
        description="This will permanently remove this character from your library."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  )
}
