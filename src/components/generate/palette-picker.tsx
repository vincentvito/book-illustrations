'use client'

import { useState } from 'react'
import { PALETTE_PRESETS, type PalettePresetId } from '@/lib/prompt-builder'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

interface PalettePickerProps {
  selected: PalettePresetId | 'custom' | null
  customPrompt: string
  onSelect: (palette: PalettePresetId | 'custom', customPrompt?: string) => void
}

export function PalettePicker({ selected, customPrompt, onSelect }: PalettePickerProps) {
  const [localCustom, setLocalCustom] = useState(customPrompt)
  const palettes = Object.values(PALETTE_PRESETS)

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-gray-700">Color Palette</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {palettes.map((palette) => (
          <Card
            key={palette.id}
            selected={selected === palette.id}
            hoverable
            onClick={() => onSelect(palette.id as PalettePresetId)}
            className="!p-3"
          >
            <div className="mb-2 flex gap-0.5">
              {palette.colors.map((color, i) => (
                <div
                  key={i}
                  className="h-6 flex-1 first:rounded-l last:rounded-r"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <p className="text-center text-xs font-medium text-gray-700">{palette.name}</p>
          </Card>
        ))}
        <Card
          selected={selected === 'custom'}
          hoverable
          onClick={() => onSelect('custom', localCustom)}
          className="!p-3 text-center"
        >
          <div className="mb-2 flex h-6 items-center justify-center rounded bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
            <span className="text-xs font-bold text-white">?</span>
          </div>
          <p className="text-xs font-medium text-gray-700">Custom</p>
        </Card>
      </div>

      {selected === 'custom' && (
        <div className="mt-3">
          <Textarea
            placeholder="Describe your color palette, e.g. 'dusty pink and sage green with warm gold accents'"
            rows={2}
            value={localCustom}
            onChange={(e) => {
              setLocalCustom(e.target.value)
              onSelect('custom', e.target.value)
            }}
          />
        </div>
      )}
    </div>
  )
}
