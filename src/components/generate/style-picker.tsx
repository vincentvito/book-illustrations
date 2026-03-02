'use client'

import { STYLE_PRESETS, type StylePresetId } from '@/lib/prompt-builder'
import { Card } from '@/components/ui/card'
import { Paintbrush } from 'lucide-react'

interface StylePickerProps {
  selected: StylePresetId | null
  onSelect: (style: StylePresetId) => void
}

export function StylePicker({ selected, onSelect }: StylePickerProps) {
  const styles = Object.values(STYLE_PRESETS)

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-gray-700">Illustration Style</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {styles.map((style) => (
          <Card
            key={style.id}
            selected={selected === style.id}
            hoverable
            onClick={() => onSelect(style.id as StylePresetId)}
            className="!p-3 text-center"
          >
            <Paintbrush className={`mx-auto mb-2 h-5 w-5 ${
              selected === style.id ? 'text-orange-600' : 'text-gray-400'
            }`} />
            <p className="text-xs font-medium text-gray-700">{style.name}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
