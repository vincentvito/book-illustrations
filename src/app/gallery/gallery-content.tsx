'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, ArrowRight } from 'lucide-react'
import {
  SHOWCASE_ITEMS,
  GALLERY_STYLES,
  GALLERY_GENRES,
} from '@/lib/gallery/showcase-data'
import { GalleryCard } from '@/components/marketing/gallery-card'

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? 'bg-orange-600 text-white'
          : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )
}

export function GalleryPageContent() {
  const [selectedStyle, setSelectedStyle] = useState('all')
  const [selectedGenre, setSelectedGenre] = useState('all')

  const filtered = SHOWCASE_ITEMS.filter((item) => {
    if (selectedStyle !== 'all' && item.styleName !== selectedStyle) return false
    if (selectedGenre !== 'all' && item.genre !== selectedGenre) return false
    return true
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-orange-600" />
            <span className="text-lg font-bold text-gray-900">Book Illustrator</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Illustration Gallery
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Every image below was created with our AI engine. Ten unique art
            styles, endless possibilities for your book.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-y border-gray-100 bg-gray-50 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2">
          <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Style:
          </span>
          <FilterPill
            label="All"
            active={selectedStyle === 'all'}
            onClick={() => setSelectedStyle('all')}
          />
          {GALLERY_STYLES.map((s) => (
            <FilterPill
              key={s}
              label={s}
              active={selectedStyle === s}
              onClick={() => setSelectedStyle(s)}
            />
          ))}
        </div>
        <div className="mx-auto mt-2 flex max-w-5xl flex-wrap items-center gap-2">
          <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Genre:
          </span>
          <FilterPill
            label="All"
            active={selectedGenre === 'all'}
            onClick={() => setSelectedGenre('all')}
          />
          {GALLERY_GENRES.map((g) => (
            <FilterPill
              key={g}
              label={g}
              active={selectedGenre === g}
              onClick={() => setSelectedGenre(g)}
            />
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, i) => (
              <GalleryCard
                key={item.id}
                item={item}
                showPalette
                showDescription
                priority={i < 3}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="py-12 text-center text-gray-400">
              No illustrations match the selected filters.
            </p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 bg-orange-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Ready to Illustrate Your Book?
          </h2>
          <p className="mt-4 text-gray-600">
            Upload your manuscript, choose a style, and generate professional
            illustrations in minutes. Start with 3 free credits.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex items-center rounded-lg bg-orange-600 px-8 py-3 text-base font-medium text-white hover:bg-orange-700"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm text-gray-400">
            Book Illustrator - AI-powered book illustrations
          </p>
        </div>
      </footer>
    </div>
  )
}
