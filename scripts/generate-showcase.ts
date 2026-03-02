import Replicate from 'replicate'
import sharp from 'sharp'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, join } from 'path'
import { buildNanoBananaPrompt } from '../src/lib/prompt-builder'
import type { StylePresetId, PalettePresetId } from '../src/lib/prompt-builder'
import type { BookFormat } from '../src/lib/image/formats'

// ── Showcase definitions ─────────────────────────────────────────────────

interface ShowcaseDefinition {
  id: string
  title: string
  description: string
  style: StylePresetId
  styleName: string
  palette: PalettePresetId
  paletteName: string
  genre: string
}

const SHOWCASE_DEFINITIONS: ShowcaseDefinition[] = [
  {
    id: 'watercolor-enchanted-oak',
    title: 'The Hidden Door',
    description:
      'A little girl in a red raincoat discovering a hidden door in an ancient oak tree, fireflies floating in twilight',
    style: 'watercolor',
    styleName: 'Watercolor',
    palette: 'forest',
    paletteName: 'Forest',
    genre: "Children's",
  },
  {
    id: 'oil-painting-knight-kingdom',
    title: 'Edge of the Kingdom',
    description:
      'A lone knight at the edge of a cliff overlooking a vast dragon-dotted kingdom at sunset',
    style: 'oil-painting',
    styleName: 'Oil Painting',
    palette: 'sunset',
    paletteName: 'Sunset',
    genre: 'Fantasy',
  },
  {
    id: 'manga-sorceress-library',
    title: 'Constellation Sorceress',
    description:
      'A young sorceress summoning a constellation of glowing stars in a moonlit library',
    style: 'manga-anime',
    styleName: 'Manga / Anime',
    palette: 'night',
    paletteName: 'Night',
    genre: 'Young Adult',
  },
  {
    id: 'flat-vector-fox-picnic',
    title: 'Cherry Blossom Picnic',
    description:
      'A cheerful fox and a shy rabbit having a picnic under a cherry blossom tree',
    style: 'flat-vector',
    styleName: 'Flat Vector',
    palette: 'pastel',
    paletteName: 'Pastel',
    genre: "Children's",
  },
  {
    id: 'pencil-sketch-fireplace',
    title: 'Fireside Stories',
    description:
      'An old man reading to wide-eyed children by a crackling fireplace',
    style: 'pencil-sketch',
    styleName: 'Pencil Sketch',
    palette: 'warm-earthy',
    paletteName: 'Warm Earthy',
    genre: 'Literary',
  },
  {
    id: 'storybook-mouse-captain',
    title: 'Captain Mouse Sets Sail',
    description:
      'A brave mouse captain steering a tiny ship through a bottle floating on a vast ocean',
    style: 'storybook',
    styleName: 'Storybook',
    palette: 'ocean',
    paletteName: 'Ocean',
    genre: "Children's Adventure",
  },
  {
    id: 'digital-painting-victorian',
    title: 'The Lantern in the Mist',
    description:
      'A mysterious woman in a Victorian dress in a misty garden, holding a glowing lantern',
    style: 'digital-painting',
    styleName: 'Digital Painting',
    palette: 'cool-blues',
    paletteName: 'Cool Blues',
    genre: 'Gothic',
  },
  {
    id: 'retro-vintage-attic',
    title: 'The Attic Explorers',
    description:
      'Two kids and their loyal dog exploring a dusty attic full of maps and telescopes',
    style: 'retro-vintage',
    styleName: 'Retro / Vintage',
    palette: 'autumn',
    paletteName: 'Autumn',
    genre: 'Middle Grade',
  },
  {
    id: 'line-art-heron-lotus',
    title: 'Heron at Dawn',
    description:
      'An elegant heron standing in still water, surrounded by lotus flowers and dragonflies',
    style: 'line-art',
    styleName: 'Line Art',
    palette: 'monochrome',
    paletteName: 'Monochrome',
    genre: 'Poetry',
  },
  {
    id: 'collage-moroccan-medina',
    title: 'Medina Market',
    description:
      'A bustling marketplace in a Moroccan medina with colorful spices and flowing textiles',
    style: 'collage',
    styleName: 'Collage',
    palette: 'vibrant',
    paletteName: 'Vibrant',
    genre: 'Cultural',
  },
]

// ── Paths ────────────────────────────────────────────────────────────────

const ROOT = resolve(__dirname, '..')
const GALLERY_DIR = join(ROOT, 'public', 'gallery')
const DATA_FILE = join(ROOT, 'src', 'lib', 'gallery', 'showcase-data.ts')

// Square format for showcase images
const SQUARE_FORMAT: BookFormat = {
  id: 'square-8.5',
  name: "Square Children's Book",
  description: '8.5" × 8.5"',
  widthInches: 8.5,
  heightInches: 8.5,
  widthPx: 2550,
  heightPx: 2550,
  aspectRatio: 1.0,
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const onlyId = args.includes('--only') ? args[args.indexOf('--only') + 1] : null
  const force = args.includes('--force')

  if (!process.env.REPLICATE_API_TOKEN) {
    console.error('Error: REPLICATE_API_TOKEN not set. Load .env.local or set the env var.')
    process.exit(1)
  }

  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

  if (!existsSync(GALLERY_DIR)) {
    mkdirSync(GALLERY_DIR, { recursive: true })
  }

  const items = onlyId
    ? SHOWCASE_DEFINITIONS.filter((d) => d.id === onlyId)
    : SHOWCASE_DEFINITIONS

  if (items.length === 0) {
    console.error(`No item found with id: ${onlyId}`)
    process.exit(1)
  }

  interface GeneratedItem {
    def: ShowcaseDefinition
    blurDataURL: string
    width: number
    height: number
  }

  const generated: GeneratedItem[] = []

  for (const def of items) {
    const outPath = join(GALLERY_DIR, `${def.id}.webp`)

    if (existsSync(outPath) && !force) {
      console.log(`[skip] ${def.id} — already exists (use --force to overwrite)`)
      // Still need metadata for the data file
      const meta = await sharp(outPath).metadata()
      const lqip = await sharp(outPath).resize(20).webp({ quality: 20 }).toBuffer()
      generated.push({
        def,
        blurDataURL: `data:image/webp;base64,${lqip.toString('base64')}`,
        width: meta.width ?? 2048,
        height: meta.height ?? 2048,
      })
      continue
    }

    console.log(`[gen] ${def.id} — "${def.title}"`)

    const prompt = buildNanoBananaPrompt({
      subject: def.description,
      style: def.style,
      palette: def.palette,
      mode: 'single',
      bookFormat: SQUARE_FORMAT,
    })

    console.log(`  prompt: ${prompt.slice(0, 100)}...`)

    const output = await replicate.run('google/nano-banana-pro', {
      input: {
        prompt,
        aspect_ratio: '1:1' as const,
        resolution: '2K',
        output_format: 'png',
        safety_tolerance: 4,
      },
    })

    const rawOutput = Array.isArray(output) ? output[0] : output
    const imageUrl = typeof rawOutput === 'string' ? rawOutput : String(rawOutput)

    if (!imageUrl || !imageUrl.startsWith('https:')) {
      console.error(`  Error: unexpected output for ${def.id}`)
      continue
    }

    console.log(`  downloading...`)
    const response = await fetch(imageUrl)
    const buffer = Buffer.from(await response.arrayBuffer())

    // Convert to WebP
    const webp = await sharp(buffer).webp({ quality: 85 }).toBuffer()
    writeFileSync(outPath, webp)

    const meta = await sharp(outPath).metadata()

    // Generate LQIP
    const lqip = await sharp(buffer).resize(20).webp({ quality: 20 }).toBuffer()

    generated.push({
      def,
      blurDataURL: `data:image/webp;base64,${lqip.toString('base64')}`,
      width: meta.width ?? 2048,
      height: meta.height ?? 2048,
    })

    console.log(`  saved: ${outPath} (${(webp.length / 1024).toFixed(0)} KB)`)
  }

  // If generating only a subset, load existing data for the rest
  if (onlyId) {
    for (const def of SHOWCASE_DEFINITIONS) {
      if (generated.some((g) => g.def.id === def.id)) continue
      const outPath = join(GALLERY_DIR, `${def.id}.webp`)
      if (existsSync(outPath)) {
        const meta = await sharp(outPath).metadata()
        const lqip = await sharp(outPath).resize(20).webp({ quality: 20 }).toBuffer()
        generated.push({
          def,
          blurDataURL: `data:image/webp;base64,${lqip.toString('base64')}`,
          width: meta.width ?? 2048,
          height: meta.height ?? 2048,
        })
      }
    }
  }

  // Sort back to original order
  generated.sort(
    (a, b) =>
      SHOWCASE_DEFINITIONS.findIndex((d) => d.id === a.def.id) -
      SHOWCASE_DEFINITIONS.findIndex((d) => d.id === b.def.id)
  )

  // Write data file
  writeShowcaseDataFile(generated)
  console.log(`\nData file written: ${DATA_FILE}`)
  console.log(`Generated ${generated.length} showcase items.`)
}

function writeShowcaseDataFile(
  items: Array<{
    def: ShowcaseDefinition
    blurDataURL: string
    width: number
    height: number
  }>
) {
  const itemsSource = items
    .map(
      ({ def, blurDataURL, width, height }) => `  {
    id: '${def.id}',
    title: '${def.title.replace(/'/g, "\\'")}',
    description: '${def.description.replace(/'/g, "\\'")}',
    style: '${def.style}',
    styleName: '${def.styleName}',
    palette: '${def.palette}',
    paletteName: '${def.paletteName}',
    genre: '${def.genre.replace(/'/g, "\\'")}',
    imagePath: '/gallery/${def.id}.webp',
    blurDataURL: '${blurDataURL}',
    width: ${width},
    height: ${height},
  }`
    )
    .join(',\n')

  const homepageStyles = [
    'watercolor',
    'oil-painting',
    'manga-anime',
    'flat-vector',
    'storybook',
    'digital-painting',
  ]

  const source = `import type { StylePresetId, PalettePresetId } from '@/lib/prompt-builder'

export interface ShowcaseItem {
  id: string
  title: string
  description: string
  style: StylePresetId
  styleName: string
  palette: PalettePresetId
  paletteName: string
  genre: string
  imagePath: string
  blurDataURL: string
  width: number
  height: number
}

export const SHOWCASE_ITEMS: ShowcaseItem[] = [
${itemsSource}
]

export const GALLERY_STYLES = [...new Set(SHOWCASE_ITEMS.map((i) => i.styleName))]
export const GALLERY_GENRES = [...new Set(SHOWCASE_ITEMS.map((i) => i.genre))]

export const HOMEPAGE_SHOWCASE = SHOWCASE_ITEMS.filter((item) =>
  ${JSON.stringify(homepageStyles)}.includes(item.style)
)
`

  writeFileSync(DATA_FILE, source, 'utf-8')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
