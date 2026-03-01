import { getReplicate } from './client'
import type { NanoBananaAspectRatio } from '@/lib/image/aspect-ratio'

export interface NanoBananaInput {
  prompt: string
  aspect_ratio: NanoBananaAspectRatio
  resolution: '1K' | '2K' | '4K'
}

export interface NanoBananaResult {
  imageUrl: string
  predictionId: string
}

export async function generateImage(input: NanoBananaInput): Promise<NanoBananaResult> {
  const output = await getReplicate().run('google/nano-banana-pro', {
    input: {
      prompt: input.prompt,
      aspect_ratio: input.aspect_ratio,
      resolution: input.resolution,
      output_format: 'png',
      safety_tolerance: 4,
    },
  })

  const rawOutput = Array.isArray(output) ? output[0] : output
  if (!rawOutput) {
    throw new Error('No output from Replicate')
  }

  // Replicate SDK v1.x returns FileOutput objects instead of plain strings.
  // FileOutput.toString() returns the URL string.
  const imageUrl = typeof rawOutput === 'string' ? rawOutput : String(rawOutput)

  if (!imageUrl || (!imageUrl.startsWith('https:') && !imageUrl.startsWith('data:'))) {
    throw new Error('Unexpected output format from Replicate')
  }

  return { imageUrl, predictionId: '' }
}
