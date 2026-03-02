import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const RequestSchema = z.object({
  storyId: z.string().uuid().optional(),
  characterName: z.string().min(1),
  appearance: z.string().min(5),
  imageUrl: z.string().url(),
  promptUsed: z.string(),
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

  const { storyId, characterName, appearance, imageUrl, promptUsed } = parsed.data

  try {
    // Download the image from the Replicate URL
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to download image' }, { status: 502 })
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const safeName = characterName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const storagePath = `${user.id}/${safeName}-${Date.now()}.png`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('character-references')
      .upload(storagePath, imageBuffer, {
        contentType: 'image/png',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to save image' }, { status: 500 })
    }

    const { data: publicUrlData } = supabase.storage
      .from('character-references')
      .getPublicUrl(storagePath)

    // Save to character library
    const { data: character, error: insertError } = await supabase
      .from('character_library')
      .insert({
        user_id: user.id,
        character_name: characterName,
        appearance_description: appearance,
        reference_image_url: publicUrlData.publicUrl,
        reference_image_path: storagePath,
        portrait_prompt_used: promptUsed,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save character' }, { status: 500 })
    }

    // Link to story if provided
    if (storyId) {
      await supabase.from('story_characters').upsert({
        story_id: storyId,
        character_id: character.id,
      }, { onConflict: 'story_id,character_id' })
    }

    return NextResponse.json({
      id: character.id,
      characterName: character.character_name,
      appearanceDescription: character.appearance_description,
      referenceImageUrl: character.reference_image_url,
    })
  } catch (error) {
    console.error('Character approve error:', error)
    return NextResponse.json({ error: 'Failed to approve character' }, { status: 500 })
  }
}

export const maxDuration = 30
