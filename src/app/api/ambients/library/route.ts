import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('ambient_library')
    .select('id, environment_name, environment_description, reference_image_url, created_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Ambient library fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch ambients' }, { status: 500 })
  }

  return NextResponse.json({
    ambients: data.map(row => ({
      id: row.id,
      environmentName: row.environment_name,
      environmentDescription: row.environment_description,
      referenceImageUrl: row.reference_image_url,
    })),
  })
}
