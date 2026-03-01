import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAnthropic } from '@/lib/claude/client'
import { buildAnalysisPrompt } from '@/lib/claude/prompts'
import { z } from 'zod'

const RequestSchema = z.object({
  storyText: z.string().min(50).max(50_000),
  mode: z.enum(['cover', 'single', 'all']),
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

  const { storyText, mode } = parsed.data
  const prompt = buildAnalysisPrompt(storyText, mode)

  try {
    const message = await getAnthropic().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = message.content.find(c => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'No response from Claude' }, { status: 500 })
    }

    const subjects = JSON.parse(textContent.text)
    return NextResponse.json(subjects)
  } catch (error) {
    console.error('Claude analysis error:', error)
    return NextResponse.json({ error: 'Failed to analyze story' }, { status: 500 })
  }
}

export const maxDuration = 30
