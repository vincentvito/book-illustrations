import type { StylePresetId, PalettePresetId } from '@/lib/prompt-builder'
import type {
  MoodTone,
  CharacterStyle,
  IllustrationType,
  Era,
  CulturalInfluence,
  DetailLevel,
} from '@/types/book-profile'

export interface StyleTemplate {
  id: string
  name: string
  description: string
  imagePath: string
  blurDataURL: string
  tags: StyleTag[]
  stylePreset: StylePresetId
  palettePreset: PalettePresetId
  moods: MoodTone[]
  characterStyle: CharacterStyle
  illustrationType: IllustrationType
  era: Era
  culturalInfluence: CulturalInfluence
  detailLevel: DetailLevel
}

export const STYLE_TAGS = [
  'whimsical',
  'dark',
  'modern',
  'classic',
  'vibrant',
  'minimal',
  'warm',
  'cool',
  'dramatic',
  'playful',
] as const

export type StyleTag = (typeof STYLE_TAGS)[number]
