'use client'

import Image from 'next/image'
import type { ShowcaseItem } from '@/lib/gallery/showcase-data'
import { PALETTE_PRESETS } from '@/lib/prompt-builder'

interface GalleryCardProps {
  item: ShowcaseItem
  showPalette?: boolean
  showDescription?: boolean
  priority?: boolean
}

export function GalleryCard({ item, showPalette, showDescription, priority }: GalleryCardProps) {
  const paletteColors = PALETTE_PRESETS[item.palette].colors

  return (
    <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={item.imagePath}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          placeholder={item.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={item.blurDataURL || undefined}
          priority={priority}
        />
      </div>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
            {item.styleName}
          </span>
          <span className="text-xs text-gray-400">{item.genre}</span>
        </div>
        <p className="mt-1.5 text-sm font-medium text-gray-900 line-clamp-1">
          {item.title}
        </p>
        {showDescription && (
          <p className="mt-1 text-xs text-gray-500 line-clamp-2">{item.description}</p>
        )}
        {showPalette && (
          <div className="mt-2 flex gap-1">
            {paletteColors.map((color, i) => (
              <div
                key={i}
                className="h-3 w-3 rounded-full border border-gray-200"
                style={{ backgroundColor: color }}
                title={item.paletteName}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
