import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateImage } from '@/lib/replicate/nano-banana'
import { buildAmbiencePortraitPrompt } from '@/lib/prompt-builder'
import { deductCredit } from '@/lib/credits'
import { getStyleTemplate } from '@/lib/style-library/templates'
import { resolveBookProfile } from '@/lib/style-library/resolve-profile'
import { z } from 'zod'
import type { BookGenre, AgeRange } from '@/types/book-profile'

const RequestSchema = z.object({
  environmentName: z.string().min(1),
  description: z.string().min(5),
  styleTemplateId: z.string().min(1),
  genre: z.string().optional(),
  ageRange: z.string().optional(),
  numberOfCandidates: z.number().int().min(1).max(4).default(4),
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

  const { environmentName, description, styleTemplateId, genre, ageRange, numberOfCandidates } = parsed.data

  const template = getStyleTemplate(styleTemplateId)
  if (!template) {
    return NextResponse.json({ error: 'Invalid style template' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single()

  if (!profile || profile.credits < 1) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 })
  }

  const creditResult = await deductCredit(supabase, user.id, 1, `Ambient portrait: ${environmentName}`)
  if (!creditResult.success) {
    return NextResponse.json({ error: 'Failed to deduct credit' }, { status: 500 })
  }

  const bookProfile = genre && ageRange
    ? resolveBookProfile(template, genre as BookGenre, ageRange as AgeRange)
    : undefined

  const prompt = buildAmbiencePortraitPrompt({
    environmentName,
    description,
    style: template.stylePreset,
    bookProfile,
  })

  try {
    const candidates = await Promise.all(
      Array.from({ length: numberOfCandidates }, () =>
        generateImage({
          prompt,
          aspect_ratio: '16:9',
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
    await deductCredit(supabase, user.id, -1, 'Refund: ambient portrait generation failed')
    console.error('Ambient portrait generation error:', error)
    return NextResponse.json({ error: 'Ambient portrait generation failed' }, { status: 500 })
  }
}

export const maxDuration = 60
