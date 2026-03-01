import { findClosestAspectRatio } from '@/lib/image/aspect-ratio'
import type { BookFormat } from '@/lib/image/formats'

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
}

export function buildNanoBananaPrompt(options: PromptOptions): string {
  const { subject, style, palette, customPalettePrompt, mode, bookFormat } = options

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

  return [
    subject,
    '',
    `STYLE: ${stylePrompt}`,
    '',
    `COLOR PALETTE: ${palettePrompt}`,
    '',
    compositionInstruction,
    '',
    'High quality, detailed book illustration, professional publishing quality.',
  ].join('\n').trim()
}
