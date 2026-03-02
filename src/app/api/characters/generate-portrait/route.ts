import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateImage } from '@/lib/replicate/nano-banana'
import { buildCharacterPortraitPrompt, STYLE_PRESETS } from '@/lib/prompt-builder'
import type { StylePresetId } from '@/lib/prompt-builder'
import { deductCredit } from '@/lib/credits'
import { z } from 'zod'
import type { BookProfile } from '@/types/book-profile'

const BookProfileSchema = z.object({
  genre: z.string(),
  ageRange: z.string(),
  moods: z.array(z.string()).min(1),
  characterStyle: z.string(),
  illustrationType: z.string(),
  era: z.string(),
  culturalInfluence: z.string(),
  detailLevel: z.string(),
}).optional()

const RequestSchema = z.object({
  characterName: z.string().min(1),
  appearance: z.string().min(5),
  style: z.string(),
  numberOfCandidates: z.number().int().min(1).max(4).default(4),
  bookProfile: BookProfileSchema,
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { characterName, appearance, style, numberOfCandidates, bookProfile: bookProfileData } = parsed.data

  if (!(style in STYLE_PRESETS)) {
    return NextResponse.json({ error: 'Invalid style' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single()

  if (!profile || profile.credits < 1) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  const creditResult = await deductCredit(supabase, user.id, 1, `Character portrait: ${characterName}`)
  if (!creditResult.success) {
    return NextResponse.json({ error: 'Failed to deduct credit' }, { status: 500 })
  }

  const prompt = buildCharacterPortraitPrompt({
    characterName,
    appearance,
    style: style as StylePresetId,
    bookProfile: bookProfileData as BookProfile | undefined,
  })

  try {
    const candidates = await Promise.all(
      Array.from({ length: numberOfCandidates }, () =>
        generateImage({
          prompt,
          aspect_ratio: '3:4',
          resolution: '1K',
        })
      )
    )

    return NextResponse.json({
      candidates: candidates.map(c => ({
        imageUrl: c.imageUrl,
        prompt,
      })),
    })
  } catch (error) {
    await deductCredit(supabase, user.id, -1, 'Refund: portrait generation failed')
    console.error('Portrait generation error:', error)
    return NextResponse.json({ error: 'Portrait generation failed' }, { status: 500 })
  }
}

export const maxDuration = 60
