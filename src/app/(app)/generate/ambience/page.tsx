'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGenerationStore, useHydrationGuard } from '@/stores/generation-store'
import { AmbientGrid } from '@/components/generate/ambient-grid'
import { AmbientLibraryModal } from '@/components/generate/ambient-library-modal'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft, Plus, Image, SkipForward, Loader2 } from 'lucide-react'
import type { Environment, EnvironmentReference } from '@/types/generation'
import { WizardStepper } from '@/components/generate/wizard-stepper'

export default function AmbiencePage() {
  const router = useRouter()
  const hasHydrated = useHydrationGuard()
  const {
    storyId, environments, setEnvironments,
    approvedEnvironmentRefs, addApprovedEnvironmentRef, removeApprovedEnvironmentRef,
    styleTemplateId, genre, ageRange, mode,
  } = useGenerationStore()

  const [libraryOpen, setLibraryOpen] = useState(false)

  useEffect(() => {
    if (!hasHydrated) return
    if (!mode || mode !== 'all' || !styleTemplateId) {
      router.push('/generate/setup')
    }
  }, [hasHydrated, mode, styleTemplateId, router])

  if (!hasHydrated || !mode || mode !== 'all' || !styleTemplateId) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const handleUpdateEnvironment = (index: number, updated: Environment) => {
    const next = [...environments]
    const oldName = next[index].name
    if (oldName !== updated.name) {
      removeApprovedEnvironmentRef(oldName)
    }
    next[index] = updated
    setEnvironments(next)
  }

  const handleRemoveEnvironment = (index: number) => {
    removeApprovedEnvironmentRef(environments[index].name)
    setEnvironments(environments.filter((_, i) => i !== index))
  }

  const handleAddEnvironment = () => {
    setEnvironments([...environments, { name: '', description: '' }])
  }

  const handleImportFromLibrary = (ref: EnvironmentReference) => {
    const exists = environments.some(e => e.name === ref.environmentName)
    if (!exists) {
      setEnvironments([...environments, {
        name: ref.environmentName,
        description: ref.environmentDescription,
      }])
    }
    addApprovedEnvironmentRef(ref)
  }

  const allApproved = environments.length > 0 && environments.every(
    e => e.name && approvedEnvironmentRefs.some(r => r.environmentName === e.name)
  )

  const handleBack = () => {
    router.push('/generate/subjects')
  }

  return (
    <div className="space-y-6">
      <WizardStepper />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ambience Studio</h1>
          <p className="text-gray-500">
            Define and approve reference environments for each setting.
            These will be used for visual consistency across all illustrations.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLibraryOpen(true)}
          >
            <Image className="mr-1.5 h-3.5 w-3.5" />
            Import from Library
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddEnvironment}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Environment
          </Button>
        </div>
      </div>

      {environments.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-gray-300 p-8">
          <p className="text-sm text-gray-500">
            No environments extracted from the story. Add environments manually or import from your library.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAddEnvironment}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Environment
            </Button>
            <Button variant="outline" size="sm" onClick={() => setLibraryOpen(true)}>
              <Image className="mr-1.5 h-3.5 w-3.5" />
              Import from Library
            </Button>
          </div>
        </div>
      ) : (
        <AmbientGrid
          environments={environments}
          approvedRefs={approvedEnvironmentRefs}
          styleTemplateId={styleTemplateId}
          genre={genre ?? undefined}
          ageRange={ageRange ?? undefined}
          storyId={storyId ?? undefined}
          onUpdateEnvironment={handleUpdateEnvironment}
          onRemoveEnvironment={handleRemoveEnvironment}
          onApproveEnvironment={addApprovedEnvironmentRef}
        />
      )}

      {environments.length > 0 && !allApproved && (
        <p className="text-sm text-amber-600">
          Generate and approve a reference for each environment to continue, or skip to use text-only generation.
        </p>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => router.push('/generate/result')}
          >
            <SkipForward className="mr-1.5 h-3.5 w-3.5" />
            Skip
          </Button>
          <Button
            disabled={!allApproved}
            onClick={() => router.push('/generate/result')}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <AmbientLibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onImport={handleImportFromLibrary}
        excludeNames={environments.map(e => e.name)}
      />
    </div>
  )
}
