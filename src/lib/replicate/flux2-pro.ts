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

const IMAGE_KEYS = [
  'input_image',
  'input_image_2',
  'input_image_3',
  'input_image_4',
  'input_image_5',
  'input_image_6',
  'input_image_7',
  'input_image_8',
] as const

export async function generateWithCharacters(input: Flux2ProInput): Promise<Flux2ProResult> {
  const imageInputs: Record<string, string> = {}
  for (let i = 0; i < Math.min(input.characterImageUrls.length, IMAGE_KEYS.length); i++) {
    imageInputs[IMAGE_KEYS[i]] = input.characterImageUrls[i]
  }

  // Caller must provide FLUX-safe dimensions (via calculateFluxDimensions).
  const w = input.width
  const h = input.height
  if (w > 2048 || h > 2048) {
    throw new Error(`FLUX dimensions exceed 2048: ${w}x${h}`)
  }
  if (w % 16 !== 0 || h % 16 !== 0) {
    throw new Error(`FLUX dimensions must be multiples of 16: ${w}x${h}`)
  }

  const output = await getReplicate().run('black-forest-labs/flux-2-pro', {
    input: {
      prompt: input.prompt,
      ...imageInputs,
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
