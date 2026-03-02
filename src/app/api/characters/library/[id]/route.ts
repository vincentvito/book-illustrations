import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch character to get storage path
  const { data: character } = await supabase
    .from('character_library')
    .select('reference_image_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!character) {
    return NextResponse.json({ error: 'Character not found' }, { status: 404 })
  }

  // Delete from storage
  await supabase.storage
    .from('character-references')
    .remove([character.reference_image_path])

  // Delete from DB (story_characters cascade via FK)
  const { error } = await supabase
    .from('character_library')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Failed to delete character' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
