import sharp from 'sharp'
import { validateImageUrl } from '@/lib/validate-image-url'

export interface ProcessingOptions {
  targetWidthPx: number
  targetHeightPx: number
  fit: 'cover' | 'contain'
  backgroundColor?: string
}

export async function processImage(
  imageUrl: string,
  options: ProcessingOptions
): Promise<Buffer> {
  validateImageUrl(imageUrl)
  const response = await fetch(imageUrl)
  if (!response.ok) throw new Error('Failed to fetch generated image')
  const inputBuffer = Buffer.from(await response.arrayBuffer())

  const { targetWidthPx, targetHeightPx, fit, backgroundColor } = options

  let pipeline = sharp(inputBuffer)

  if (fit === 'cover') {
    pipeline = pipeline.resize(targetWidthPx, targetHeightPx, {
      fit: 'cover',
      position: 'centre',
    })
  } else {
    pipeline = pipeline.resize(targetWidthPx, targetHeightPx, {
      fit: 'contain',
      background: backgroundColor ?? '#FFFFFF',
    })
  }

  return pipeline.png({ quality: 95 }).toBuffer()
}
