'use client'

import { BOOK_FORMATS } from '@/lib/image/formats'
import { Card } from '@/components/ui/card'

interface FormatPickerProps {
  selected: string | null
  onSelect: (formatId: string) => void
}

export function FormatPicker({ selected, onSelect }: FormatPickerProps) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-gray-700">Book Format</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {BOOK_FORMATS.map((format) => (
          <Card
            key={format.id}
            selected={selected === format.id}
            hoverable
            onClick={() => onSelect(format.id)}
            className="!p-3"
          >
            <div className="mb-2 flex justify-center">
              <div
                className={`border ${
                  selected === format.id ? 'border-orange-400 bg-orange-50' : 'border-gray-300 bg-gray-50'
                }`}
                style={{
                  width: `${Math.min(format.widthInches * 6, 60)}px`,
                  height: `${Math.min(format.heightInches * 6, 60)}px`,
                }}
              />
            </div>
            <p className="text-center text-xs font-medium text-gray-700">{format.name}</p>
            <p className="text-center text-xs text-gray-500">{format.description}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
