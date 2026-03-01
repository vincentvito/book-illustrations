import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const UpdateStorySchema = z.object({
  title: z.string().min(1).max(200).optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: story, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', storyId)
    .eq('user_id', user.id)
    .single()

  if (error || !story) {
    return NextResponse.json({ error: 'Story not found' }, { status: 404 })
  }

  const { data: generations } = await supabase
    .from('generations')
    .select('id, mode, style, palette, book_format, subject, image_url, status, created_at')
    .eq('story_id', storyId)
    .eq('status', 'completed')
    .order('created_at', { ascending: true })

  return NextResponse.json({ story: { ...story, generations: generations ?? [] } })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = UpdateStorySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data: story, error } = await supabase
    .from('stories')
    .update(parsed.data)
    .eq('id', storyId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error || !story) {
    return NextResponse.json({ error: 'Story not found' }, { status: 404 })
  }

  return NextResponse.json({ story })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', storyId)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete story' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
