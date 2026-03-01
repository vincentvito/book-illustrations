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

    // Strip markdown code fences if Claude wraps the JSON
    let jsonText = textContent.text.trim()
    const fenceMatch = jsonText.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/)
    if (fenceMatch) {
      jsonText = fenceMatch[1].trim()
    }

    const result = JSON.parse(jsonText)

    if (!result.subjects || !Array.isArray(result.subjects) || result.subjects.length === 0) {
      return NextResponse.json(
        { error: 'AI returned an unexpected format. Please try again.' },
        { status: 502 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Claude analysis error:', error)
    const isTimeout = error instanceof Error && (
      error.message.includes('timeout') ||
      error.message.includes('ETIMEDOUT') ||
      error.name === 'AbortError'
    )
    return NextResponse.json(
      { error: isTimeout
          ? 'The story analysis took too long. Try a shorter excerpt or try again.'
          : 'Failed to analyze story. Please try again.'
      },
      { status: isTimeout ? 504 : 500 }
    )
  }
}

export const maxDuration = 45
