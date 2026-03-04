import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateImageUrl } from '@/lib/validate-image-url'
import { z } from 'zod'

const RequestSchema = z.object({
  storyId: z.string().uuid().optional(),
  environmentName: z.string().min(1),
  description: z.string().min(5),
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

  const { storyId, environmentName, description, imageUrl, promptUsed } = parsed.data

  try {
    validateImageUrl(imageUrl)
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to download image' }, { status: 502 })
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const safeName = environmentName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const storagePath = `${user.id}/${safeName}-${Date.now()}.png`

    const { error: uploadError } = await supabase.storage
      .from('ambient-references')
      .upload(storagePath, imageBuffer, {
        contentType: 'image/png',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to save image' }, { status: 500 })
    }

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('ambient-references')
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365)

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error('Signed URL error:', signedUrlError)
      return NextResponse.json({ error: 'Failed to create image URL' }, { status: 500 })
    }

    const { data: ambient, error: insertError } = await supabase
      .from('ambient_library')
      .insert({
        user_id: user.id,
        environment_name: environmentName,
        environment_description: description,
        reference_image_url: signedUrlData.signedUrl,
        reference_image_path: storagePath,
        ambient_prompt_used: promptUsed,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save ambient' }, { status: 500 })
    }

    if (storyId) {
      await supabase.from('story_ambients').upsert({
        story_id: storyId,
        ambient_id: ambient.id,
      }, { onConflict: 'story_id,ambient_id' })
    }

    return NextResponse.json({
      id: ambient.id,
      environmentName: ambient.environment_name,
      environmentDescription: ambient.environment_description,
      referenceImageUrl: ambient.reference_image_url,
    })
  } catch (error) {
    console.error('Ambient approve error:', error)
    return NextResponse.json({ error: 'Failed to approve ambient' }, { status: 500 })
  }
}

export const maxDuration = 30
