import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateImage } from '@/lib/replicate/nano-banana'
import { buildNanoBananaPrompt, STYLE_PRESETS, PALETTE_PRESETS } from '@/lib/prompt-builder'
import type { StylePresetId, PalettePresetId } from '@/lib/prompt-builder'
import { BOOK_FORMATS } from '@/lib/image/formats'
import { findClosestAspectRatio } from '@/lib/image/aspect-ratio'
import { deductCredit } from '@/lib/credits'
import { z } from 'zod'

const GenerateSchema = z.object({
  subject: z.string().min(10),
  style: z.string(),
  palette: z.string(),
  customPalettePrompt: z.string().optional(),
  mode: z.enum(['cover', 'single', 'all']),
  bookFormatId: z.string(),
  resolution: z.enum(['1K', '2K', '4K']).default('2K'),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = GenerateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { subject, style, palette, customPalettePrompt, mode, bookFormatId, resolution } = parsed.data

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single()

  if (!profile || profile.credits < 1) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  const bookFormat = BOOK_FORMATS.find(f => f.id === bookFormatId)
  if (!bookFormat) {
    return NextResponse.json({ error: 'Invalid book format' }, { status: 400 })
  }

  const prompt = buildNanoBananaPrompt({
    subject,
    style: style as StylePresetId,
    palette: palette as PalettePresetId | 'custom',
    customPalettePrompt,
    mode,
    bookFormat,
  })

  const arInfo = findClosestAspectRatio(bookFormat.aspectRatio)

  const creditResult = await deductCredit(supabase, user.id, 1, `Generated ${mode} illustration`)
  if (!creditResult.success) {
    return NextResponse.json({ error: 'Failed to deduct credit' }, { status: 500 })
  }

  try {
    const result = await generateImage({
      prompt,
      aspect_ratio: arInfo.id,
      resolution,
    })

    await supabase.from('generations').insert({
      user_id: user.id,
      mode,
      style,
      palette,
      book_format: bookFormatId,
      subject,
      prompt_used: prompt,
      replicate_prediction_id: result.predictionId,
      aspect_ratio: arInfo.id,
      resolution,
      credits_used: 1,
      status: 'completed',
    })

    return NextResponse.json({
      imageUrl: result.imageUrl,
      aspectRatio: arInfo.id,
      bookFormatId,
      prompt,
    })
  } catch (error) {
    await deductCredit(supabase, user.id, -1, 'Refund: generation failed')

    console.error('Generation error:', error)
    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 })
  }
}

export const maxDuration = 60
