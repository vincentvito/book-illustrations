import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CreateStorySchema = z.object({
  title: z.string().min(1).max(200),
  story_text: z.string().min(1),
  filename: z.string().nullable().optional(),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: stories, error } = await supabase
    .from('stories')
    .select('id, title, filename, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 })
  }

  // Fetch generation counts and thumbnails for each story
  const storyIds = stories.map(s => s.id)

  const { data: generations } = await supabase
    .from('generations')
    .select('story_id, image_url, created_at')
    .in('story_id', storyIds.length > 0 ? storyIds : ['_none_'])
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  const genMap = new Map<string, { count: number; thumbnail: string | null }>()
  for (const gen of generations ?? []) {
    if (!gen.story_id) continue
    const existing = genMap.get(gen.story_id)
    if (existing) {
      existing.count++
    } else {
      genMap.set(gen.story_id, { count: 1, thumbnail: gen.image_url })
    }
  }

  const result = stories.map(s => ({
    id: s.id,
    title: s.title,
    filename: s.filename,
    updated_at: s.updated_at,
    generation_count: genMap.get(s.id)?.count ?? 0,
    thumbnail_url: genMap.get(s.id)?.thumbnail ?? null,
  }))

  return NextResponse.json({ stories: result })
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = CreateStorySchema.safeParse(body)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      const firstError = Object.values(fieldErrors).flat()[0]
      return NextResponse.json(
        { error: firstError ?? 'Invalid story data' },
        { status: 400 }
      )
    }

    const { title, story_text, filename } = parsed.data

    const { data: story, error } = await supabase
      .from('stories')
      .insert({
        user_id: user.id,
        title,
        story_text,
        filename: filename ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error('Story insert failed:', error.message, error.code, error.details)
      return NextResponse.json({ error: 'Failed to create story' }, { status: 500 })
    }

    return NextResponse.json({ story })
  } catch (error) {
    console.error('Unhandled error in POST /api/stories:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
