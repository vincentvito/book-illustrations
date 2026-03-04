import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateImage } from '@/lib/replicate/nano-banana'
import { generateWithCharacters } from '@/lib/replicate/flux2-pro'
import { buildNanoBananaPrompt, buildFlux2ScenePrompt } from '@/lib/prompt-builder'
import { BOOK_FORMATS } from '@/lib/image/formats'
import { findClosestAspectRatio } from '@/lib/image/aspect-ratio'
import { calculateFluxDimensions } from '@/lib/image/flux-dimensions'
import { deductCredit } from '@/lib/credits'
import { getStyleTemplate } from '@/lib/style-library/templates'
import { resolveBookProfile } from '@/lib/style-library/resolve-profile'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import sharp from 'sharp'
import type { BookGenre, AgeRange } from '@/types/book-profile'

const CharacterRefSchema = z.object({
  characterName: z.string(),
  appearanceDescription: z.string().optional(),
  referenceImageUrl: z.string().url(),
})

const EnvironmentRefSchema = z.object({
  environmentName: z.string(),
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
  environmentReferences: z.array(EnvironmentRefSchema).optional(),
  subjectEnvironment: z.string().optional(),
  editInstructions: z.string().max(500).optional(),
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
    environmentReferences, subjectEnvironment,
    editInstructions,
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

  // Determine which environment reference to use for this subject
  const relevantEnvRef = environmentReferences && subjectEnvironment
    ? environmentReferences.find(ref =>
        ref.environmentName.toLowerCase() === subjectEnvironment.toLowerCase()
      )
    : undefined
  const envRefs = relevantEnvRef ? [relevantEnvRef] : []

  // Combine all image refs (characters first, then environments), capped at 8 for FLUX 2 Pro
  const allImageUrls = [
    ...relevantRefs.map(r => r.referenceImageUrl),
    ...envRefs.map(r => r.referenceImageUrl),
  ].slice(0, 8)

  const useFlux2 = allImageUrls.length > 0

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
      characterAppearances: relevantRefs.map(r => r.appearanceDescription ?? ''),
      environmentNames: envRefs.map(r => r.environmentName),
    })
  } else {
    prompt = buildNanoBananaPrompt({
      subject,
      style: template.stylePreset,
      palette: template.palettePreset,
      mode,
      bookFormat,
      bookProfile,
      characters: characterReferences?.map(r => ({
        name: r.characterName,
        appearance: r.appearanceDescription ?? '',
      })),
    })
  }

  if (editInstructions) {
    prompt += `\n\nEDIT INSTRUCTIONS: Keep the same overall scene, style, and composition, but apply these changes: ${editInstructions}`
  }

  const arInfo = findClosestAspectRatio(bookFormat.aspectRatio)

  const creditResult = await deductCredit(supabase, user.id, 1, `Generated ${mode} illustration`)
  if (!creditResult.success) {
    return NextResponse.json({ error: 'Failed to deduct credit' }, { status: 500 })
  }

  try {
    let imageUrl: string

    if (useFlux2) {
      const fluxDims = calculateFluxDimensions(bookFormat.widthPx, bookFormat.heightPx)
      const result = await generateWithCharacters({
        prompt,
        characterImageUrls: allImageUrls,
        width: fluxDims.width,
        height: fluxDims.height,
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

    console.log(`[generate] Used ${useFlux2 ? 'FLUX 2 Pro' : 'Nano-Banana'}, refs: ${allImageUrls.length}`)

    if (req.signal.aborted) {
      await deductCredit(supabase, user.id, -1, 'Refund: client disconnected')
      return NextResponse.json({ error: 'Client disconnected' }, { status: 499 })
    }

    // Post-process: resize to exact book format dimensions and upload to Storage
    let finalImageUrl = imageUrl
    let storagePath: string | null = null

    try {
      const rawResponse = await fetch(imageUrl)
      if (!rawResponse.ok) throw new Error(`Failed to fetch raw image: ${rawResponse.status}`)
      const rawBuffer = Buffer.from(await rawResponse.arrayBuffer())

      const processedBuffer = await sharp(rawBuffer)
        .resize(bookFormat.widthPx, bookFormat.heightPx, {
          fit: 'cover',
          position: 'centre',
        })
        .png({ quality: 95 })
        .toBuffer()

      storagePath = `${user.id}/${randomUUID()}.png`

      const { error: uploadError } = await supabase.storage
        .from('generated-illustrations')
        .upload(storagePath, processedBuffer, {
          contentType: 'image/png',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('generated-illustrations')
        .createSignedUrl(storagePath, 60 * 60 * 24 * 365)

      if (signedUrlError || !signedUrlData?.signedUrl) throw signedUrlError ?? new Error('Failed to create signed URL')

      finalImageUrl = signedUrlData.signedUrl
    } catch (processError) {
      console.error('[generate] Post-processing failed, using raw URL:', processError)
      storagePath = null
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
      image_url: finalImageUrl,
      image_storage_path: storagePath,
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
      imageUrl: finalImageUrl,
      aspectRatio: arInfo.id,
      bookFormatId,
      prompt,
    })
  } catch (error) {
    await deductCredit(supabase, user.id, -1, 'Refund: generation failed')

    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('[generate] error:', { error: errMsg, useFlux2, refCount: relevantRefs.length })
    return NextResponse.json({ error: `Image generation failed: ${errMsg}` }, { status: 500 })
  }
}

export const maxDuration = 120
