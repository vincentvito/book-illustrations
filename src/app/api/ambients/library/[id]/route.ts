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

  const { data: ambient } = await supabase
    .from('ambient_library')
    .select('reference_image_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!ambient) {
    return NextResponse.json({ error: 'Ambient not found' }, { status: 404 })
  }

  await supabase.storage
    .from('ambient-references')
    .remove([ambient.reference_image_path])

  const { error } = await supabase
    .from('ambient_library')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Failed to delete ambient' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
