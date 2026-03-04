'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { AmbientPortraitCandidates } from './ambient-portrait-candidates'
import { Sparkles, Trash2, Check } from 'lucide-react'
import type { Environment, EnvironmentReference } from '@/types/generation'
import type { BookGenre, AgeRange } from '@/types/book-profile'

interface AmbientCardProps {
  environment: Environment
  approvedRef?: EnvironmentReference
  styleTemplateId: string
  genre?: BookGenre
  ageRange?: AgeRange
  storyId?: string
  onUpdate: (updated: Environment) => void
  onRemove: () => void
  onApprove: (ref: EnvironmentReference) => void
}

export function AmbientCard({
  environment,
  approvedRef,
  styleTemplateId,
  genre,
  ageRange,
  storyId,
  onUpdate,
  onRemove,
  onApprove,
}: AmbientCardProps) {
  const [candidates, setCandidates] = useState<Array<{ imageUrl: string; prompt: string }>>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [generating, setGenerating] = useState(false)
  const [approving, setApproving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    setCandidates([])
    setSelectedIndex(null)

    try {
      const res = await fetch('/api/ambients/generate-portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          environmentName: environment.name,
          description: environment.description,
          styleTemplateId,
          genre,
          ageRange,
          numberOfCandidates: 4,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Failed to generate environment images')
        return
      }

      const data = await res.json()
      setCandidates(data.candidates)
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleApprove = async () => {
    if (selectedIndex === null || !candidates[selectedIndex]) return
    setApproving(true)

    try {
      const res = await fetch('/api/ambients/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          environmentName: environment.name,
          description: environment.description,
          imageUrl: candidates[selectedIndex].imageUrl,
          promptUsed: candidates[selectedIndex].prompt,
        }),
      })

      if (!res.ok) {
        setError('Failed to save environment')
        return
      }

      const data = await res.json()
      onApprove(data)
      toast.success(`${environment.name} environment approved!`)
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setApproving(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Input
            value={environment.name}
            onChange={(e) => onUpdate({ ...environment, name: e.target.value })}
            placeholder="Environment name"
            className="font-semibold"
          />
          <Textarea
            value={environment.description}
            onChange={(e) => onUpdate({ ...environment, description: e.target.value })}
            placeholder="Visual description of the environment..."
            rows={3}
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="ml-2 rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
          title="Remove environment"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {approvedRef && !candidates.length && (
        <div className="mb-3">
          <div className="relative mx-auto max-w-xs overflow-hidden rounded-lg border-2 border-green-500">
            <img
              src={approvedRef.referenceImageUrl}
              alt={approvedRef.environmentName}
              className="aspect-[16/9] w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-green-500/90 px-2 py-0.5 text-center text-xs font-medium text-white">
              <Check className="mr-1 inline h-3 w-3" />
              Approved
            </div>
          </div>
        </div>
      )}

      <AmbientPortraitCandidates
        candidates={candidates}
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
        loading={generating}
      />

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-3 flex gap-2">
        {!approvedRef || candidates.length > 0 ? (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerate}
              loading={generating}
              disabled={!environment.name || !environment.description}
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              {candidates.length ? 'Regenerate' : 'Generate Environment'}
            </Button>
            {(selectedIndex !== null || approvedRef) && (
              <Button
                size="sm"
                onClick={handleApprove}
                loading={approving}
                disabled={!!approvedRef}
                variant={approvedRef ? 'outline' : 'primary'}
                className={approvedRef ? 'border-green-500 text-green-600' : ''}
              >
                <Check className="mr-1.5 h-3.5 w-3.5" />
                {approvedRef ? 'Approved' : 'Approve'}
              </Button>
            )}
          </>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerate}
            loading={generating}
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Regenerate Environment
          </Button>
        )}
      </div>
    </div>
  )
}
