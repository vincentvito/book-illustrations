'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Check } from 'lucide-react'
import { STYLE_TEMPLATES } from '@/lib/style-library/templates'
import { STYLE_TAGS, type StyleTag } from '@/lib/style-library/types'
import { PALETTE_PRESETS } from '@/lib/prompt-builder'

interface StyleLibraryPickerProps {
  selected: string | null
  onSelect: (id: string) => void
}

export function StyleLibraryPicker({ selected, onSelect }: StyleLibraryPickerProps) {
  const [activeTag, setActiveTag] = useState<StyleTag | null>(null)

  const filtered = activeTag
    ? STYLE_TEMPLATES.filter(t => t.tags.includes(activeTag))
    : STYLE_TEMPLATES

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-gray-700">Choose Your Style</h3>

      {/* Tag filter pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTag(null)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            activeTag === null
              ? 'border-orange-500 bg-orange-50 text-orange-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
        >
          All
        </button>
        {STYLE_TAGS.map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
              activeTag === tag
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Style cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(template => {
          const isSelected = selected === template.id
          const paletteColors = PALETTE_PRESETS[template.palettePreset].colors

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template.id)}
              className={`group overflow-hidden rounded-xl border-2 bg-white text-left transition-all ${
                isSelected
                  ? 'border-orange-500 ring-2 ring-orange-200 shadow-lg'
                  : 'border-gray-200 hover:shadow-md hover:border-gray-300'
              }`}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={template.imagePath}
                  alt={template.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  placeholder="blur"
                  blurDataURL={template.blurDataURL}
                />
                {isSelected && (
                  <div className="absolute top-2 right-2 rounded-full bg-orange-500 p-1 shadow-sm">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <div className="px-4 py-3">
                <p className="text-sm font-medium text-gray-900">{template.name}</p>
                <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{template.description}</p>
                <div className="mt-2 flex gap-1">
                  {paletteColors.map((color, i) => (
                    <div
                      key={i}
                      className="h-4 w-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
