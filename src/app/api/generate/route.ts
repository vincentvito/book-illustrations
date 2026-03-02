import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateImage } from '@/lib/replicate/nano-banana'
import { generateWithCharacters } from '@/lib/replicate/flux2-pro'
import { buildNanoBananaPrompt, buildFlux2ScenePrompt } from '@/lib/prompt-builder'
import type { StylePresetId, PalettePresetId } from '@/lib/prompt-builder'
import { BOOK_FORMATS } from '@/lib/image/formats'
import { findClosestAspectRatio } from '@/lib/image/aspect-ratio'
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

const CharacterRefSchema = z.object({
  characterName: z.string(),
  referenceImageUrl: z.string().url(),
})

const GenerateSchema = z.object({
  subject: z.string().min(10),
  style: z.string(),
  palette: z.string(),
  customPalettePrompt: z.string().optional(),
  mode: z.enum(['cover', 'single', 'all']),
  bookFormatId: z.string(),
  resolution: z.enum(['1K', '2K', '4K']).default('2K'),
  storyId: z.string().uuid().optional(),
  bookProfile: BookProfileSchema,
  characterReferences: z.array(CharacterRefSchema).optional(),
  subjectCharacters: z.array(z.string()).optional(),
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

  const {
    subject, style, palette, customPalettePrompt, mode, bookFormatId,
    resolution, storyId, bookProfile: bookProfileData,
    characterReferences, subjectCharacters,
  } = parsed.data

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

  const bookProfile = bookProfileData as BookProfile | undefined

  // Determine which character references to use for this specific subject
  const relevantRefs = characterReferences && subjectCharacters
    ? characterReferences.filter(ref =>
        subjectCharacters.includes(ref.characterName)
      )
    : characterReferences ?? []

  const useFlux2 = relevantRefs.length > 0

  let prompt: string
  if (useFlux2) {
    prompt = buildFlux2ScenePrompt({
      subject,
      style: style as StylePresetId,
      palette: palette as PalettePresetId | 'custom',
      customPalettePrompt,
      mode,
      bookFormat,
      bookProfile,
      characterNames: relevantRefs.map(r => r.characterName),
    })
  } else {
    prompt = buildNanoBananaPrompt({
      subject,
      style: style as StylePresetId,
      palette: palette as PalettePresetId | 'custom',
      customPalettePrompt,
      mode,
      bookFormat,
      bookProfile,
    })
  }

  const arInfo = findClosestAspectRatio(bookFormat.aspectRatio)

  const creditResult = await deductCredit(supabase, user.id, 1, `Generated ${mode} illustration`)
  if (!creditResult.success) {
    return NextResponse.json({ error: 'Failed to deduct credit' }, { status: 500 })
  }

  try {
    let imageUrl: string

    if (useFlux2) {
      const result = await generateWithCharacters({
        prompt,
        characterImageUrls: relevantRefs.map(r => r.referenceImageUrl),
        width: bookFormat.widthPx,
        height: bookFormat.heightPx,
      })
      imageUrl = result.imageUrl
    } else {
      const result = await generateImage({
        prompt,
        aspect_ratio: arInfo.id,
        resolution,
      })
      imageUrl = result.imageUrl
    }

    await supabase.from('generations').insert({
      user_id: user.id,
      mode,
      style,
      palette,
      book_format: bookFormatId,
      subject,
      prompt_used: prompt,
      aspect_ratio: arInfo.id,
      resolution,
      credits_used: 1,
      status: 'completed',
      story_id: storyId ?? null,
      image_url: imageUrl,
    })

    if (storyId) {
      await supabase.from('stories')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', storyId)
    }

    return NextResponse.json({
      imageUrl,
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

export const maxDuration = 120
