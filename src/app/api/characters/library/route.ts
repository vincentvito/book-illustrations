import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('character_library')
    .select('id, character_name, appearance_description, reference_image_url, created_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Library fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 })
  }

  return NextResponse.json({
    characters: data.map(row => ({
      id: row.id,
      characterName: row.character_name,
      appearanceDescription: row.appearance_description,
      referenceImageUrl: row.reference_image_url,
    })),
  })
}
