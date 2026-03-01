'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGenerationStore } from '@/stores/generation-store'
import { SubjectGrid } from '@/components/generate/subject-grid'
import { GenerationProgress } from '@/components/generate/generation-progress'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react'
import type { Subject } from '@/types/generation'

export default function SubjectsPage() {
  const router = useRouter()
  const {
    storyText, mode, subjects, selectedSubjects,
    setSubjects, selectSubject, deselectSubject, replaceSubject, setStatus, status
  } = useGenerationStore()
  const [regeneratingId, setRegeneratingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchSubjects = async () => {
    if (!storyText || !mode) return
    setLoading(true)
    setStatus('analyzing')

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyText, mode }),
      })
      const data = await res.json()

      if (res.ok && data.subjects) {
        setSubjects(data.subjects)
      }
    } catch (error) {
      console.error('Analysis error:', error)
    } finally {
      setLoading(false)
      setStatus('idle')
    }
  }

  useEffect(() => {
    if (!storyText || !mode) {
      router.push('/generate')
      return
    }
    if (subjects.length === 0) {
      fetchSubjects()
    }
  }, [])

  const handleRegenerate = async (subjectId: number) => {
    if (!storyText || !mode) return
    setRegeneratingId(subjectId)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyText, mode }),
      })
      const data = await res.json()

      if (res.ok && data.subjects) {
        const newSubject = data.subjects.find((s: Subject) => s.id === subjectId) || data.subjects[0]
        if (newSubject) {
          replaceSubject(subjectId, { ...newSubject, id: subjectId })
        }
      }
    } catch (error) {
      console.error('Regenerate error:', error)
    } finally {
      setRegeneratingId(null)
    }
  }

  const handleSelect = (subject: Subject) => {
    const isSelected = selectedSubjects.some(s => s.id === subject.id)
    if (isSelected) {
      deselectSubject(subject.id)
    } else {
      selectSubject(subject)
    }
  }

  const canContinue = mode === 'all'
    ? selectedSubjects.length > 0
    : selectedSubjects.length === 1

  if (loading || status === 'analyzing') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suggested Subjects</h1>
          <p className="text-gray-500">AI is reading your story...</p>
        </div>
        <GenerationProgress status="analyzing" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Choose Your Subject{mode === 'all' ? 's' : ''}</h1>
          <p className="text-gray-500">
            {mode === 'all'
              ? 'Select the illustrations you want to generate'
              : 'Pick one subject for your illustration'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSubjects} loading={loading}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Regenerate All
        </Button>
      </div>

      <SubjectGrid
        subjects={subjects}
        selectedIds={selectedSubjects.map(s => s.id)}
        onSelect={handleSelect}
        onRegenerate={handleRegenerate}
        regeneratingId={regeneratingId}
      />

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.push('/generate')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button disabled={!canContinue} onClick={() => router.push('/generate/style')}>
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
