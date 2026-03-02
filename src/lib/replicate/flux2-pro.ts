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

  // FLUX.2 Pro output dimensions must be multiples of 16 and total <= 9MP.
  // Cap each dimension to keep the product under 9 million pixels.
  const MAX_PIXELS = 9_000_000
  let w = Math.round(input.width / 16) * 16
  let h = Math.round(input.height / 16) * 16

  if (w * h > MAX_PIXELS) {
    const scale = Math.sqrt(MAX_PIXELS / (w * h))
    w = Math.round((w * scale) / 16) * 16
    h = Math.round((h * scale) / 16) * 16
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
