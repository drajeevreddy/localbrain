import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/crypto'
import { callLLM } from '@/lib/llm/adapter'
import type { ProviderName } from '@/lib/llm/adapter'

async function getUserApiKey(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<{ provider: ProviderName; apiKey: string } | null> {
  const { data } = await supabase
    .from('user_settings')
    .select('provider_configs, default_provider')
    .eq('user_id', userId)
    .single()
  if (!data) return null
  const configs = Array.isArray(data.provider_configs) ? data.provider_configs : []
  const active = configs.find((c: { enabled?: boolean; apiKey?: string }) => c.enabled && c.apiKey)
  if (!active) return null
  try {
    return { provider: active.name || data.default_provider, apiKey: decrypt(active.apiKey) }
  } catch { return null }
}

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser()
  if (error) return error

  const body = await request.json()
  const { noteId, content, mode } = body as {
    noteId?: string
    content?: string
    mode: 'flashcards' | 'quiz' | 'summary' | 'key-points'
  }

  if (!content || !mode) {
    return Response.json({ error: 'Missing content or mode' }, { status: 400 })
  }

  const supabase = await createClient()
  const creds = await getUserApiKey(supabase, user!.id)
  if (!creds) {
    return Response.json({ error: 'No LLM provider configured' }, { status: 400 })
  }

  const { provider, apiKey } = creds

  const prompts: Record<string, string> = {
    flashcards: `Create flashcards from this content. Return a JSON array of objects with "front" (question) and "back" (answer). Make 5-10 high-quality flashcards covering the most important concepts. Return ONLY the JSON array, no explanation.`,
    quiz: `Create a quiz from this content. Return a JSON array of objects with "question", "options" (array of 4 choices), and "correctIndex" (0-3). Make 5-8 questions covering key concepts. Return ONLY the JSON array, no explanation.`,
    summary: `Provide a comprehensive study summary of this content. Include: 1) A 2-3 sentence overview, 2) Key concepts (bullet points), 3) Important formulas or definitions if any, 4) Study tips for this topic. Use markdown formatting.`,
    'key-points': `Extract the most important key points from this content. Return a JSON array of strings, each being a concise key point. Focus on facts, definitions, and critical concepts. Return ONLY the JSON array, no explanation.`,
  }

  const truncatedContent = content.slice(0, 4000)

  let response: string
  try {
    response = await callLLM(
      [
        { role: 'system', content: 'You are a study assistant. Output only what is requested, no extra text.' },
        { role: 'user', content: `${prompts[mode]}\n\nContent:\n${truncatedContent}` },
      ],
      { provider, apiKey }
    )
  } catch (err) {
    return Response.json({ error: `LLM error: ${err instanceof Error ? err.message : 'unknown'}` }, { status: 500 })
  }

  let result: unknown
  if (mode === 'summary') {
    result = response
  } else {
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      try {
        result = JSON.parse(jsonMatch[0])
      } catch {
        result = []
      }
    } else {
      result = []
    }
  }

  return Response.json({ result, mode })
}
