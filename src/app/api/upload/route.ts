import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseFile } from '@/lib/upload/parser'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const text = await parseFile(buffer, file.name)
    const truncated = text.slice(0, 50_000)

    return NextResponse.json({
      text: truncated,
      filename: file.name,
      charCount: truncated.length,
      wasTruncated: text.length > 50_000,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to parse file'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
