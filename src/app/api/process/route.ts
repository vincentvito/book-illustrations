import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processImage } from '@/lib/image/processor'
import { BOOK_FORMATS } from '@/lib/image/formats'
import { z } from 'zod'

const ProcessSchema = z.object({
  imageUrl: z.string().url(),
  bookFormatId: z.string(),
  fit: z.enum(['cover', 'contain']).default('cover'),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = ProcessSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const bookFormat = BOOK_FORMATS.find(f => f.id === parsed.data.bookFormatId)
  if (!bookFormat) {
    return NextResponse.json({ error: 'Invalid book format' }, { status: 400 })
  }

  try {
    const imageBuffer = await processImage(parsed.data.imageUrl, {
      targetWidthPx: bookFormat.widthPx,
      targetHeightPx: bookFormat.heightPx,
      fit: parsed.data.fit,
    })

    return new NextResponse(new Uint8Array(imageBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="illustration-${bookFormat.id}.png"`,
        'Content-Length': imageBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Processing error:', error)
    return NextResponse.json({ error: 'Image processing failed' }, { status: 500 })
  }
}

export const maxDuration = 30
