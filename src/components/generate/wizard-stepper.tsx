'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Check } from 'lucide-react'
import { useGenerationStore } from '@/stores/generation-store'

interface Step {
  path: string
  label: string
}

const BASE_STEPS: Step[] = [
  { path: '/upload', label: 'Upload' },
  { path: '/generate/setup', label: 'Style' },
  { path: '/generate', label: 'Mode' },
  { path: '/generate/characters', label: 'Characters' },
  { path: '/generate/subjects', label: 'Subjects' },
  { path: '/generate/result', label: 'Result' },
]

export function WizardStepper() {
  const pathname = usePathname()
  const { mode } = useGenerationStore()

  const steps = [...BASE_STEPS]
  // Insert Ambience before Result if applicable
  if (mode === 'all') {
    const resultIdx = steps.findIndex(s => s.path === '/generate/result')
    steps.splice(resultIdx, 0, { path: '/generate/ambience', label: 'Ambience' })
  }

  const currentIndex = steps.findIndex((s) => s.path === pathname)

  return (
    <nav aria-label="Wizard progress" className="mb-2">
      {/* Desktop */}
      <ol className="hidden items-center sm:flex">
        {steps.map((step, i) => {
          const isCompleted = currentIndex > i
          const isCurrent = currentIndex === i

          return (
            <li key={step.path} className="flex flex-1 items-center last:flex-none">
              <StepCircle
                step={step}
                index={i}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
              />
              {i < steps.length - 1 && (
                <div
                  className={`mx-1 h-0.5 flex-1 ${
                    currentIndex > i ? 'bg-orange-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </li>
          )
        })}
      </ol>

      {/* Mobile */}
      <div className="flex items-center justify-between sm:hidden">
        <div className="flex gap-1.5">
          {steps.map((step, i) => {
            const isCompleted = currentIndex > i
            const isCurrent = currentIndex === i

            return (
              <div key={step.path} className="flex items-center gap-1.5">
                {isCompleted ? (
                  <Link href={step.path} aria-label={step.label}>
                    <div className="h-2 w-2 rounded-full bg-orange-600" />
                  </Link>
                ) : (
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isCurrent ? 'bg-orange-600 ring-2 ring-orange-200' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
        {currentIndex >= 0 && (
          <span className="text-xs text-gray-500">
            Step {currentIndex + 1} of {steps.length}
          </span>
        )}
      </div>
    </nav>
  )
}

function StepCircle({
  step,
  index,
  isCompleted,
  isCurrent,
}: {
  step: Step
  index: number
  isCompleted: boolean
  isCurrent: boolean
}) {
  const circle = (
    <span className="flex flex-col items-center gap-1">
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
          isCompleted
            ? 'bg-orange-600 text-white'
            : isCurrent
              ? 'border-2 border-orange-600 text-orange-600'
              : 'border-2 border-gray-300 text-gray-400'
        }`}
      >
        {isCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
      </span>
      <span
        className={`text-xs ${
          isCompleted || isCurrent ? 'font-medium text-orange-600' : 'text-gray-400'
        }`}
      >
        {step.label}
      </span>
    </span>
  )

  if (isCompleted) {
    return (
      <Link href={step.path} className="transition-opacity hover:opacity-80">
        {circle}
      </Link>
    )
  }

  return circle
}
