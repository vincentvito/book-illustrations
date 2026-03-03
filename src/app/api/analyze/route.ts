import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAnthropic } from '@/lib/claude/client'
import { buildAnalysisPrompt } from '@/lib/claude/prompts'
import { APIConnectionTimeoutError } from '@anthropic-ai/sdk'
import { getStyleTemplate } from '@/lib/style-library/templates'
import { resolveBookProfile } from '@/lib/style-library/resolve-profile'
import { z } from 'zod'
import type { BookGenre, AgeRange } from '@/types/book-profile'

const RequestSchema = z.object({
  storyText: z.string().min(50).max(50_000),
  mode: z.enum(['cover', 'single', 'all']),
  styleTemplateId: z.string().optional(),
  genre: z.string().optional(),
  ageRange: z.string().optional(),
})

const ANALYZE_MODEL = 'claude-sonnet-4-20250514'
const ANALYZE_TIMEOUT_MS = 240_000

function createRequestId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `analyze_${Date.now().toString(36)}`
}

export async function POST(req: NextRequest) {
  const requestId = createRequestId()
  const requestStartedAt = Date.now()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized', requestId }, { status: 401 })
  }

  const body = await req.json()
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten(), requestId }, { status: 400 })
  }

  const { storyText, mode, styleTemplateId, genre, ageRange } = parsed.data

  // Resolve BookProfile from style template + genre + ageRange
  let bookProfile = undefined
  if (styleTemplateId && genre && ageRange) {
    const template = getStyleTemplate(styleTemplateId)
    if (template) {
      bookProfile = resolveBookProfile(template, genre as BookGenre, ageRange as AgeRange)
    }
  }

  const prompt = buildAnalysisPrompt(storyText, mode, bookProfile)
  console.info('[analyze] request-start', {
    requestId,
    userId: user.id,
    mode,
    storyLength: storyText.length,
    promptLength: prompt.length,
    startedAt: new Date(requestStartedAt).toISOString(),
  })

  try {
    const anthropicStartedAt = Date.now()
    console.info('[analyze] anthropic-call-start', {
      requestId,
      model: ANALYZE_MODEL,
      timeoutMs: ANALYZE_TIMEOUT_MS,
      maxRetries: 0,
    })
    const message = await getAnthropic().messages.create({
      model: ANALYZE_MODEL,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }, {
      timeout: ANALYZE_TIMEOUT_MS,
      maxRetries: 0,
    })
    console.info('[analyze] anthropic-call-success', {
      requestId,
      durationMs: Date.now() - anthropicStartedAt,
    })

    const textContent = message.content.find(c => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      console.warn('[analyze] no-text-response', { requestId })
      return NextResponse.json({ error: 'No response from Claude', requestId }, { status: 500 })
    }

    // Strip markdown code fences if Claude wraps the JSON
    let jsonText = textContent.text.trim()
    const fenceMatch = jsonText.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/)
    if (fenceMatch) {
      jsonText = fenceMatch[1].trim()
    }

    const result = JSON.parse(jsonText)

    if (!result.subjects || !Array.isArray(result.subjects) || result.subjects.length === 0) {
      console.warn('[analyze] invalid-subjects-shape', { requestId })
      return NextResponse.json(
        { error: 'AI returned an unexpected format. Please try again.', requestId },
        { status: 502 }
      )
    }

    console.info('[analyze] request-success', {
      requestId,
      subjectCount: result.subjects.length,
      characterCount: Array.isArray(result.characters) ? result.characters.length : 0,
      totalDurationMs: Date.now() - requestStartedAt,
    })
    return NextResponse.json(result)
  } catch (error) {
    const errorName = error instanceof Error ? error.name : 'UnknownError'
    const errorMessage = error instanceof Error ? error.message : String(error)
    const isTimeout = error instanceof APIConnectionTimeoutError ||
      (error instanceof Error && (
        error.message.includes('timeout') ||
        error.message.includes('ETIMEDOUT') ||
        error.name === 'AbortError'
      ))

    console.error('[analyze] request-failed', {
      requestId,
      errorName,
      errorMessage,
      isTimeout,
      totalDurationMs: Date.now() - requestStartedAt,
    })

    return NextResponse.json(
      {
        error: isTimeout
          ? 'The story analysis took too long. Try a shorter excerpt or try again.'
          : 'Failed to analyze story. Please try again.',
        ...(isTimeout ? { code: 'ANALYZE_TIMEOUT' } : {}),
        requestId,
      },
      { status: isTimeout ? 504 : 500 }
    )
  }
}

export const maxDuration = 260
