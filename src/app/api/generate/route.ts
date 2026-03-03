import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateImage } from '@/lib/replicate/nano-banana'
import { generateWithCharacters } from '@/lib/replicate/flux2-pro'
import { buildNanoBananaPrompt, buildFlux2ScenePrompt } from '@/lib/prompt-builder'
import { BOOK_FORMATS } from '@/lib/image/formats'
import { findClosestAspectRatio } from '@/lib/image/aspect-ratio'
import { deductCredit } from '@/lib/credits'
import { getStyleTemplate } from '@/lib/style-library/templates'
import { resolveBookProfile } from '@/lib/style-library/resolve-profile'
import { z } from 'zod'
import type { BookGenre, AgeRange } from '@/types/book-profile'

const CharacterRefSchema = z.object({
  characterName: z.string(),
  referenceImageUrl: z.string().url(),
})

const GenerateSchema = z.object({
  subject: z.string().min(10),
  styleTemplateId: z.string().min(1),
  genre: z.string().optional(),
  ageRange: z.string().optional(),
  mode: z.enum(['cover', 'single', 'all']),
  bookFormatId: z.string(),
  resolution: z.enum(['1K', '2K', '4K']).default('2K'),
  storyId: z.string().uuid().optional(),
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
    subject, styleTemplateId, genre, ageRange, mode, bookFormatId,
    resolution, storyId,
    characterReferences, subjectCharacters,
  } = parsed.data

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

  const bookFormat = BOOK_FORMATS.find(f => f.id === bookFormatId)
  if (!bookFormat) {
    return NextResponse.json({ error: 'Invalid book format' }, { status: 400 })
  }

  const bookProfile = genre && ageRange
    ? resolveBookProfile(template, genre as BookGenre, ageRange as AgeRange)
    : undefined

  // Determine which character references to use for this specific subject
  const subjectCharsLower = subjectCharacters?.map(s => s.toLowerCase())
  const relevantRefs = characterReferences && subjectCharsLower
    ? characterReferences.filter(ref =>
        subjectCharsLower.includes(ref.characterName.toLowerCase())
      )
    : characterReferences ?? []

  const useFlux2 = relevantRefs.length > 0

  let prompt: string
  if (useFlux2) {
    prompt = buildFlux2ScenePrompt({
      subject,
      style: template.stylePreset,
      palette: template.palettePreset,
      mode,
      bookFormat,
      bookProfile,
      characterNames: relevantRefs.map(r => r.characterName),
    })
  } else {
    prompt = buildNanoBananaPrompt({
      subject,
      style: template.stylePreset,
      palette: template.palettePreset,
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

  let actuallyUseFlux2 = useFlux2

  try {
    // Verify reference image URLs are accessible before calling FLUX.2 Pro
    if (useFlux2) {
      for (const ref of relevantRefs) {
        try {
          const headRes = await fetch(ref.referenceImageUrl, { method: 'HEAD' })
          if (!headRes.ok) {
            console.error(`[generate] Reference image not accessible: ${ref.characterName} -> ${headRes.status}`)
            actuallyUseFlux2 = false
            break
          }
        } catch (e) {
          console.error(`[generate] Reference image fetch error: ${ref.characterName}`, e)
          actuallyUseFlux2 = false
          break
        }
      }
      if (!actuallyUseFlux2) {
        console.warn('[generate] Falling back to nano-banana due to inaccessible reference images')
        prompt = buildNanoBananaPrompt({
          subject,
          style: template.stylePreset,
          palette: template.palettePreset,
          mode,
          bookFormat,
          bookProfile,
        })
      }
    }

    let imageUrl: string

    if (actuallyUseFlux2) {
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

    if (req.signal.aborted) {
      await deductCredit(supabase, user.id, -1, 'Refund: client disconnected')
      return NextResponse.json({ error: 'Client disconnected' }, { status: 499 })
    }

    const { error: insertError } = await supabase.from('generations').insert({
      user_id: user.id,
      mode,
      style: template.stylePreset,
      palette: template.palettePreset,
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

    if (insertError) {
      console.error('Failed to persist generation:', insertError)
    }

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

    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('[generate] error:', { error: errMsg, useFlux2: actuallyUseFlux2, refCount: relevantRefs.length })
    return NextResponse.json({ error: `Image generation failed: ${errMsg}` }, { status: 500 })
  }
}

export const maxDuration = 120
