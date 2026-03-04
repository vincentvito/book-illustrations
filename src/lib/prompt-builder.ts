import { findClosestAspectRatio } from '@/lib/image/aspect-ratio'
import type { BookFormat } from '@/lib/image/formats'
import type { BookProfile } from '@/types/book-profile'
import {
  BOOK_GENRES,
  AGE_RANGES,
  MOOD_TONES,
  CHARACTER_STYLES,
  ILLUSTRATION_TYPES,
  DETAIL_LEVELS,
  CULTURAL_INFLUENCES,
} from '@/types/book-profile'

export const STYLE_PRESETS = {
  watercolor: {
    id: 'watercolor',
    name: 'Watercolor',
    prompt: 'watercolor painting style, soft washes, visible brush strokes, wet-on-wet technique, delicate color blending, paper texture visible',
  },
  'pencil-sketch': {
    id: 'pencil-sketch',
    name: 'Pencil Sketch',
    prompt: 'detailed pencil sketch, graphite drawing, cross-hatching, fine line work, shading with pencil strokes, on textured paper',
  },
  'digital-painting': {
    id: 'digital-painting',
    name: 'Digital Painting',
    prompt: 'digital painting, polished illustration, smooth blending, vibrant colors, professional digital art style',
  },
  'flat-vector': {
    id: 'flat-vector',
    name: 'Flat Vector',
    prompt: 'flat vector illustration style, clean shapes, bold outlines, minimal shading, geometric simplicity, modern graphic design',
  },
  storybook: {
    id: 'storybook',
    name: 'Storybook / Whimsical',
    prompt: "whimsical children's book illustration, warm and charming, slightly exaggerated proportions, soft lighting, enchanting atmosphere, storybook quality",
  },
  'manga-anime': {
    id: 'manga-anime',
    name: 'Manga / Anime',
    prompt: 'manga illustration style, anime-inspired art, expressive eyes, dynamic composition, clean linework, cel-shaded coloring',
  },
  'oil-painting': {
    id: 'oil-painting',
    name: 'Oil Painting',
    prompt: 'classical oil painting style, rich impasto texture, deep shadows, luminous highlights, traditional fine art quality, canvas texture',
  },
  collage: {
    id: 'collage',
    name: 'Collage',
    prompt: 'mixed media collage style, layered textures, cut paper elements, found imagery combined, tactile and dimensional quality',
  },
  'line-art': {
    id: 'line-art',
    name: 'Line Art',
    prompt: 'clean line art illustration, precise ink outlines, no fills or minimal color, elegant contours, pen and ink style',
  },
  'retro-vintage': {
    id: 'retro-vintage',
    name: 'Retro / Vintage',
    prompt: 'retro vintage illustration style, muted color palette, mid-century aesthetic, halftone dots, aged paper quality, nostalgic feel',
  },
} as const

export type StylePresetId = keyof typeof STYLE_PRESETS

export const PALETTE_PRESETS = {
  'warm-earthy': {
    id: 'warm-earthy',
    name: 'Warm Earthy',
    colors: ['#8B4513', '#D2691E', '#F4A460', '#DEB887', '#FAEBD7'],
    prompt: 'warm earthy color palette with rich browns, burnt sienna, sandy beige, and cream tones',
  },
  'cool-blues': {
    id: 'cool-blues',
    name: 'Cool Blues',
    colors: ['#1B3A5C', '#4682B4', '#87CEEB', '#B0E0E6', '#F0F8FF'],
    prompt: 'cool blue color palette with deep navy, steel blue, sky blue, and ice white',
  },
  pastel: {
    id: 'pastel',
    name: 'Pastel',
    colors: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#E8BAFF'],
    prompt: 'soft pastel color palette with gentle pinks, mint greens, baby blues, and lavender',
  },
  vibrant: {
    id: 'vibrant',
    name: 'Vibrant',
    colors: ['#FF1744', '#FF9100', '#FFEA00', '#00E676', '#2979FF'],
    prompt: 'vibrant bold color palette with saturated reds, oranges, yellows, greens, and blues',
  },
  monochrome: {
    id: 'monochrome',
    name: 'Monochrome',
    colors: ['#1A1A1A', '#4D4D4D', '#808080', '#B3B3B3', '#E6E6E6'],
    prompt: 'monochrome grayscale palette with deep blacks, medium grays, and soft whites',
  },
  autumn: {
    id: 'autumn',
    name: 'Autumn',
    colors: ['#8B0000', '#CC5500', '#DAA520', '#556B2F', '#2F1B14'],
    prompt: 'autumn color palette with deep reds, burnt orange, golden yellow, olive green, and dark brown',
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    colors: ['#003545', '#006D77', '#83C5BE', '#EDF6F9', '#FFDDD2'],
    prompt: 'ocean-inspired palette with deep teal, aquamarine, seafoam, sandy white, and coral accents',
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    colors: ['#1B4332', '#2D6A4F', '#52B788', '#95D5B2', '#D8F3DC'],
    prompt: 'forest green palette with deep emerald, sage, mint, and soft mossy tones',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    colors: ['#370617', '#9D0208', '#DC2F02', '#F48C06', '#FFBA08'],
    prompt: 'sunset palette with deep burgundy, crimson red, vermillion, amber, and golden yellow',
  },
  night: {
    id: 'night',
    name: 'Night',
    colors: ['#0D1B2A', '#1B2838', '#324A5F', '#5C677D', '#C4B7CB'],
    prompt: 'nighttime palette with midnight blue, dark slate, steel gray, and soft moonlit lavender',
  },
} as const

export type PalettePresetId = keyof typeof PALETTE_PRESETS

export interface PromptOptions {
  subject: string
  style: StylePresetId
  palette: PalettePresetId | 'custom'
  customPalettePrompt?: string
  mode: 'cover' | 'single' | 'all'
  bookFormat: BookFormat
  bookProfile?: BookProfile
  characters?: { name: string; appearance: string }[]
}

// ── Helper ────────────────────────────────────────────────────────────────

function profileLabel<T extends { id: string; label: string }>(
  list: readonly T[],
  id: string
): string {
  return list.find((item) => item.id === id)?.label ?? id
}

function buildProfilePromptBlock(profile: BookProfile): string {
  const genre = profileLabel(BOOK_GENRES, profile.genre)
  const age = profileLabel(AGE_RANGES, profile.ageRange)
  const moods = profile.moods.map((m) => profileLabel(MOOD_TONES, m)).join(', ')
  const detail = profileLabel(DETAIL_LEVELS, profile.detailLevel)

  const lines: string[] = []

  // Audience — drives complexity and content safety
  lines.push(`AUDIENCE: ${genre} for ${age}. `)
  switch (profile.ageRange) {
    case '0-3':
    case '3-5':
      lines[lines.length - 1] += 'Use simple, clear compositions with large friendly characters. Bright, saturated colors. Rounded, friendly shapes. No scary or complex imagery.'
      break
    case '6-8':
      lines[lines.length - 1] += 'Clear, engaging compositions. Moderately detailed. Bright and inviting. Avoid frightening imagery.'
      break
    case '9-12':
      lines[lines.length - 1] += 'Dynamic, engaging compositions with moderate complexity. Can include action and drama.'
      break
    case '13-17':
      lines[lines.length - 1] += 'Atmospheric, emotionally rich compositions. Detailed environments. Can handle dramatic or intense imagery.'
      break
    case '18+':
      lines[lines.length - 1] += 'Full artistic range. Sophisticated, nuanced compositions with rich detail.'
      break
  }

  // Tone
  lines.push(`TONE: ${moods}. The overall atmosphere should reflect this mood.`)

  // Character style
  if (profile.characterStyle !== 'auto') {
    const charLabel = profileLabel(CHARACTER_STYLES, profile.characterStyle)
    let charInstruction = ''
    switch (profile.characterStyle) {
      case 'stylized-cartoon':
        charInstruction = 'rounded features, exaggerated expressions, bold outlines'
        break
      case 'chibi-cute':
        charInstruction = 'oversized heads, tiny bodies, large sparkling eyes'
        break
      case 'anthropomorphic':
        charInstruction = 'animal characters with human posture and clothing'
        break
      case 'abstract-silhouette':
        charInstruction = 'shapes and silhouettes, focus on gesture over detail'
        break
      case 'realistic':
        charInstruction = 'realistic proportions, detailed features, natural textures'
        break
      case 'classic-storybook':
        charInstruction = 'warm, gentle features, slightly idealized, traditional illustration feel'
        break
    }
    lines.push(`CHARACTER STYLE: ${charLabel} — ${charInstruction}.`)
  }

  // Detail level
  lines.push(`DETAIL: ${detail} level of detail.`)

  // Illustration type composition hints
  switch (profile.illustrationType) {
    case 'spot':
      lines.push('FRAMING: Spot illustration — subject floats on white/transparent background, no full scene, compact composition.')
      break
    case 'vignette':
      lines.push('FRAMING: Vignette — scene fades softly into white at the edges, no hard borders.')
      break
    case 'half-page':
      lines.push('FRAMING: Half-page illustration — compose to work in roughly half the page area, leave clear space on one side for text.')
      break
    case 'double-spread':
      lines.push('FRAMING: Double-page spread — ultra-wide panoramic composition, spread across full horizontal extent.')
      break
  }

  // Cultural context
  if (profile.culturalInfluence !== 'none') {
    const culture = profileLabel(CULTURAL_INFLUENCES, profile.culturalInfluence)
    lines.push(`CULTURAL CONTEXT: ${culture} influence — reflect in architecture, clothing, patterns, and environmental details.`)
  }

  return lines.join('\n')
}

// ── Character portrait prompt ─────────────────────────────────────────────

export interface CharacterPortraitOptions {
  characterName: string
  appearance: string
  style: StylePresetId
  bookProfile?: BookProfile
}

export function buildCharacterPortraitPrompt(options: CharacterPortraitOptions): string {
  const { characterName, appearance, style, bookProfile } = options
  const styleName = STYLE_PRESETS[style].name
  const stylePrompt = STYLE_PRESETS[style].prompt

  const parts = [
    `${stylePrompt}. Full body character portrait of ${characterName}: ${appearance}.`,
    '',
    'COMPOSITION: Single character standing in a 3/4 view against a simple, clean, neutral background.',
    'The character should be clearly visible from head to toe with good lighting on the face and body.',
    'No other characters, no complex backgrounds, no text.',
  ]

  if (bookProfile) {
    const profileBlock = buildProfilePromptBlock(bookProfile)
    parts.push('', profileBlock)
  }

  parts.push('', `${styleName} character reference illustration, clear details, professional quality.`)

  return parts.join('\n').trim()
}

// ── Ambience portrait prompt ──────────────────────────────────────────────

export interface AmbiencePortraitOptions {
  environmentName: string
  description: string
  style: StylePresetId
  bookProfile?: BookProfile
}

export function buildAmbiencePortraitPrompt(options: AmbiencePortraitOptions): string {
  const { environmentName, description, style, bookProfile } = options
  const styleName = STYLE_PRESETS[style].name
  const stylePrompt = STYLE_PRESETS[style].prompt

  const parts = [
    `${stylePrompt}. Wide establishing shot of ${environmentName}: ${description}.`,
    '',
    'COMPOSITION: Environment-only scene with no characters or people visible.',
    'Show the full setting with depth — foreground details, middle ground, and distant background.',
    'Rich environmental detail: textures, lighting, atmosphere, weather.',
    'No text, no UI elements, no characters.',
  ]

  if (bookProfile) {
    const profileBlock = buildProfilePromptBlock(bookProfile)
    parts.push('', profileBlock)
  }

  parts.push('', `${styleName} environment reference illustration, clear details, professional quality, landscape format.`)

  return parts.join('\n').trim()
}

// ── FLUX.2 scene prompt with character references ─────────────────────────

export interface Flux2SceneOptions {
  subject: string
  style: StylePresetId
  palette: PalettePresetId | 'custom'
  customPalettePrompt?: string
  mode: 'cover' | 'single' | 'all'
  bookFormat: BookFormat
  bookProfile?: BookProfile
  characterNames: string[]
  characterAppearances?: string[]
  environmentNames?: string[]
}

export function buildFlux2ScenePrompt(options: Flux2SceneOptions): string {
  const { subject, style, palette, customPalettePrompt, mode, bookFormat, bookProfile, characterNames, characterAppearances, environmentNames } = options

  const styleName = STYLE_PRESETS[style].name
  const stylePrompt = STYLE_PRESETS[style].prompt
  const palettePrompt = palette === 'custom'
    ? (customPalettePrompt ?? '')
    : PALETTE_PRESETS[palette].prompt
  const paletteColors = palette !== 'custom' ? PALETTE_PRESETS[palette].colors : undefined

  // Build character reference instructions with appearance descriptions
  const characterRefs = characterNames.map((name, i) => {
    const imageNum = i + 1
    const appearance = characterAppearances?.[i]
    return appearance
      ? `${name} (the character shown in input image ${imageNum}): ${appearance}`
      : `${name} (the character shown in input image ${imageNum})`
  })

  const subjectsJson = characterNames.map((name, i) => ({
    description: `${name} (from image ${i + 1})`,
  }))

  const isPortrait = bookFormat.aspectRatio < 0.95
  const isLandscape = bookFormat.aspectRatio > 1.05
  let compositionHint = 'balanced composition'
  if (mode === 'cover') {
    compositionHint = 'book cover composition, main subject in center and lower two-thirds, upper 25% clear for title'
  } else if (isPortrait) {
    compositionHint = 'vertical/portrait format, centered subject'
  } else if (isLandscape) {
    compositionHint = 'horizontal/landscape format, spread across width'
  }

  const profileBlock = bookProfile ? buildProfilePromptBlock(bookProfile) : ''

  const structured = {
    scene: subject,
    subjects: subjectsJson,
    ...(paletteColors ? { color_palette: paletteColors } : {}),
    lighting: profileBlock ? undefined : 'professional book illustration lighting',
  }

  const parts = [
    // Front-load style at the very beginning for maximum model attention
    `A ${styleName} illustration. ${stylePrompt}.`,
    '',
    JSON.stringify(structured, null, 2),
    '',
    `CHARACTERS: The reference images show character identity only. ${characterRefs.join('. ')}. Match their face, hair, clothing, and body type from the reference images.`,
    `IMPORTANT: Use reference images ONLY for character/environment identity. The art style of the ENTIRE image must be ${styleName}: ${stylePrompt}. Do NOT copy the rendering style from the reference images.`,
    ...((environmentNames && environmentNames.length > 0) ? [
      '',
      `ENVIRONMENT REFERENCES: ${environmentNames.map((name, i) => {
        const imageNum = characterNames.length + i + 1
        return `${name} (the environment shown in input image ${imageNum})`
      }).join('. ')}. Match the layout, architecture, and vegetation but render in ${styleName} style.`,
    ] : []),
    '',
    `COLOR PALETTE: ${palettePrompt}`,
    `COMPOSITION: ${compositionHint}`,
    'FRAMING: Ensure all important subjects and focal elements are slightly inset from the edges, leaving a thin margin of background at all borders.',
  ]

  if (profileBlock) {
    parts.push('', profileBlock)
  }

  parts.push('', `${styleName} book illustration, professional publishing quality.`)

  return parts.join('\n').trim()
}

// ── Nano-banana prompt (text-to-image, no references) ─────────────────────

export function buildNanoBananaPrompt(options: PromptOptions): string {
  const { subject, style, palette, customPalettePrompt, mode, bookFormat, bookProfile, characters } = options

  const styleName = STYLE_PRESETS[style].name
  const stylePrompt = STYLE_PRESETS[style].prompt
  const palettePrompt = palette === 'custom'
    ? (customPalettePrompt ?? '')
    : PALETTE_PRESETS[palette].prompt

  const isPortrait = bookFormat.aspectRatio < 0.95
  const isLandscape = bookFormat.aspectRatio > 1.05

  let compositionInstruction = ''

  if (mode === 'cover') {
    compositionInstruction = `COMPOSITION: This is a book cover illustration. The main subject should be positioned in the center and lower two-thirds of the image. The upper 25-30% of the image MUST have a clear, uncluttered area (sky, gradient, or soft background) to leave space for title text. Do NOT place important visual elements in the top quarter.`
  } else if (isPortrait) {
    compositionInstruction = `COMPOSITION: Vertical/portrait format illustration. Center the main subject with appropriate breathing room on all sides. The composition should work well in a tall, narrow format.`
  } else if (isLandscape) {
    compositionInstruction = `COMPOSITION: Horizontal/landscape format illustration. Spread the composition across the width, using the full horizontal space. Center the focal point.`
  } else {
    compositionInstruction = `COMPOSITION: Square format illustration. Center the main subject with balanced composition on all sides.`
  }

  const profileBlock = bookProfile ? buildProfilePromptBlock(bookProfile) : ''

  const parts = [
    `${stylePrompt}. ${subject}`,
  ]

  if (characters && characters.length > 0) {
    const charDescs = characters
      .filter(c => c.appearance)
      .map(c => `${c.name}: ${c.appearance}`)
    if (charDescs.length > 0) {
      parts.push('', `CHARACTERS: ${charDescs.join('. ')}. Maintain these exact appearances throughout the scene.`)
    }
  }

  parts.push(
    '',
    `COLOR PALETTE: ${palettePrompt}`,
    '',
    compositionInstruction,
    'FRAMING: Ensure all important subjects and focal elements are slightly inset from the edges, leaving a thin margin of background at all borders.',
  )

  if (profileBlock) {
    parts.push('', profileBlock)
  }

  parts.push('', `${styleName} book illustration, professional publishing quality.`)

  return parts.join('\n').trim()
}
