import { getReplicate } from './client'

export interface Flux2ProInput {
  prompt: string
  characterImageUrls: string[]
  width: number
  height: number
}

export interface Flux2ProResult {
  imageUrl: string
}

const MAX_INPUT_IMAGES = 8

export async function generateWithCharacters(input: Flux2ProInput): Promise<Flux2ProResult> {
  // Caller must provide FLUX-safe dimensions (via calculateFluxDimensions).
  const w = input.width
  const h = input.height
  if (w > 2048 || h > 2048) {
    throw new Error(`FLUX dimensions exceed 2048: ${w}x${h}`)
  }
  if (w % 32 !== 0 || h % 32 !== 0) {
    throw new Error(`FLUX dimensions must be multiples of 32: ${w}x${h}`)
  }

  const imageUrls = input.characterImageUrls.slice(0, MAX_INPUT_IMAGES)

  console.log(`[FLUX2Pro] Generating with ${imageUrls.length} reference images, dims: ${w}x${h}`)

  const output = await getReplicate().run('black-forest-labs/flux-2-pro', {
    input: {
      prompt: input.prompt,
      input_images: imageUrls,
      aspect_ratio: 'custom',
      width: w,
      height: h,
      output_format: 'png',
      safety_tolerance: 4,
    },
  })

  const rawOutput = Array.isArray(output) ? output[0] : output
  if (!rawOutput) {
    throw new Error('No output from FLUX.2 Pro')
  }

  const imageUrl = typeof rawOutput === 'string' ? rawOutput : String(rawOutput)

  if (!imageUrl || (!imageUrl.startsWith('https:') && !imageUrl.startsWith('data:'))) {
    throw new Error('Unexpected output format from FLUX.2 Pro')
  }

  return { imageUrl }
}
