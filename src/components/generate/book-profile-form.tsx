'use client'

import { useCallback } from 'react'
import { Card } from '@/components/ui/card'
import {
  BOOK_GENRES,
  AGE_RANGES,
  MOOD_TONES,
  CHARACTER_STYLES,
  ILLUSTRATION_TYPES,
  ERAS,
  CULTURAL_INFLUENCES,
  DETAIL_LEVELS,
  GENRE_DEFAULTS,
  type BookProfile,
  type BookGenre,
  type MoodTone,
} from '@/types/book-profile'
import {
  BookOpen,
  Baby,
  Palette,
  User,
  Frame,
  Clock,
  Globe,
  Layers,
} from 'lucide-react'

interface BookProfileFormProps {
  profile: BookProfile
  onChange: (profile: BookProfile) => void
}

const DEFAULT_PROFILE: BookProfile = {
  genre: 'children-picture-book',
  ageRange: '3-5',
  moods: ['cheerful', 'whimsical'],
  characterStyle: 'stylized-cartoon',
  illustrationType: 'full-page',
  era: 'timeless',
  culturalInfluence: 'none',
  detailLevel: 'simple',
}

export { DEFAULT_PROFILE }

export function BookProfileForm({ profile, onChange }: BookProfileFormProps) {
  const update = useCallback(
    (patch: Partial<BookProfile>) => onChange({ ...profile, ...patch }),
    [profile, onChange]
  )

  const handleGenreChange = useCallback(
    (genre: BookGenre) => {
      const defaults = GENRE_DEFAULTS[genre]
      onChange({
        ...profile,
        genre,
        ...defaults,
      })
    },
    [profile, onChange]
  )

  const toggleMood = useCallback(
    (mood: MoodTone) => {
      const moods = profile.moods.includes(mood)
        ? profile.moods.filter((m) => m !== mood)
        : [...profile.moods, mood]
      update({ moods: moods.length > 0 ? moods : [mood] })
    },
    [profile.moods, update]
  )

  return (
    <div className="space-y-8">
      {/* Genre */}
      <Section icon={BookOpen} title="Book Genre" required>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {BOOK_GENRES.map((g) => (
            <Card
              key={g.id}
              selected={profile.genre === g.id}
              hoverable
              onClick={() => handleGenreChange(g.id)}
              className="!p-3 text-center"
            >
              <p className="text-xs font-semibold text-gray-800">{g.label}</p>
              <p className="mt-0.5 text-[10px] text-gray-500">{g.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Age Range */}
      <Section icon={Baby} title="Target Age" required>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {AGE_RANGES.map((a) => (
            <Card
              key={a.id}
              selected={profile.ageRange === a.id}
              hoverable
              onClick={() => update({ ageRange: a.id })}
              className="!p-3 text-center"
            >
              <p className="text-xs font-semibold text-gray-800">{a.label}</p>
              <p className="mt-0.5 text-[10px] text-gray-500">{a.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Mood / Tone — multi-select */}
      <Section icon={Palette} title="Mood / Tone" required hint="Select one or more">
        <div className="flex flex-wrap gap-2">
          {MOOD_TONES.map((m) => {
            const selected = profile.moods.includes(m.id)
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggleMood(m.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selected
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {m.label}
              </button>
            )
          })}
        </div>
      </Section>

      {/* Character Style */}
      <Section icon={User} title="Character Style">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {CHARACTER_STYLES.map((c) => (
            <Card
              key={c.id}
              selected={profile.characterStyle === c.id}
              hoverable
              onClick={() => update({ characterStyle: c.id })}
              className="!p-3 text-center"
            >
              <p className="text-xs font-semibold text-gray-800">{c.label}</p>
              <p className="mt-0.5 text-[10px] text-gray-500">{c.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Illustration Type */}
      <Section icon={Frame} title="Illustration Type">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ILLUSTRATION_TYPES.map((t) => (
            <Card
              key={t.id}
              selected={profile.illustrationType === t.id}
              hoverable
              onClick={() => update({ illustrationType: t.id })}
              className="!p-3 text-center"
            >
              <p className="text-xs font-semibold text-gray-800">{t.label}</p>
              <p className="mt-0.5 text-[10px] text-gray-500">{t.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Era / Time Period */}
      <Section icon={Clock} title="Era / Time Period">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
          {ERAS.map((e) => (
            <Card
              key={e.id}
              selected={profile.era === e.id}
              hoverable
              onClick={() => update({ era: e.id })}
              className="!p-3 text-center"
            >
              <p className="text-xs font-semibold text-gray-800">{e.label}</p>
              <p className="mt-0.5 text-[10px] text-gray-500">{e.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Cultural / Regional Influence */}
      <Section icon={Globe} title="Cultural / Regional Influence">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
          {CULTURAL_INFLUENCES.map((c) => (
            <Card
              key={c.id}
              selected={profile.culturalInfluence === c.id}
              hoverable
              onClick={() => update({ culturalInfluence: c.id })}
              className="!p-3 text-center"
            >
              <p className="text-xs font-semibold text-gray-800">{c.label}</p>
              <p className="mt-0.5 text-[10px] text-gray-500">{c.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Detail Level */}
      <Section icon={Layers} title="Detail Level">
        <div className="grid grid-cols-3 gap-3">
          {DETAIL_LEVELS.map((d) => (
            <Card
              key={d.id}
              selected={profile.detailLevel === d.id}
              hoverable
              onClick={() => update({ detailLevel: d.id })}
              className="!p-3 text-center"
            >
              <p className="text-xs font-semibold text-gray-800">{d.label}</p>
              <p className="mt-0.5 text-[10px] text-gray-500">{d.description}</p>
            </Card>
          ))}
        </div>
      </Section>

    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  required,
  hint,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-700">
          {title}
          {required && <span className="ml-1 text-red-400">*</span>}
        </h3>
        {hint && <span className="text-xs text-gray-400">— {hint}</span>}
      </div>
      {children}
    </div>
  )
}
