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
  try { return { provider: active.name || data.default_provider, apiKey: decrypt(active.apiKey) } }
  catch { return null }
}

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser()
  if (error) return error

  const body = await request.json()
  const { content, mode, context } = body as {
    content?: string
    mode: string
    context?: string
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
  const truncatedContent = content.slice(0, 4000)

  const prompts: Record<string, string> = {
    'email-draft': `Write a professional email based on this content. Include: Subject line, greeting, body (clear and concise), call to action, and sign-off. Use a professional but friendly tone. Return ONLY the email text.`,
    'email-reply': `Draft a professional email reply to this content. Be concise, address key points, and maintain a professional tone. Return ONLY the email text.`,
    'action-items': `Extract action items from this content. Return a JSON array of objects with "task" (string), "assignee" (string or "Unassigned"), "priority" ("high"/"medium"/"low"), and "deadline" (string or null). Return ONLY the JSON array.`,
    'meeting-summary': `Create a structured meeting summary from these notes. Include: 1) Meeting overview (1-2 sentences), 2) Key decisions made, 3) Discussion points with outcomes, 4) Action items with owners, 5) Next steps. Use markdown formatting.`,
    'project-status': `Generate a project status update from this content. Include: 1) Overall status (On Track/At Risk/Off Track), 2) Progress summary, 3) Key accomplishments, 4) Blockers/risks, 5) Next milestones. Use markdown.`,
    'presentation-outline': `Create a presentation outline from this content. Return a JSON array of slides, each with "title" (string), "bullets" (array of 2-4 bullet points), and "speakerNotes" (1-2 sentences). Make 5-10 slides. Return ONLY the JSON array.`,
    'executive-summary': `Write an executive summary of this content. Keep it to 3-4 paragraphs. Focus on: key findings, implications, and recommended actions. Use clear, concise business language.`,
    'brainstorm': `Help structure these brainstorming notes. Return a JSON object with: "ideas" (array of strings), "themes" (array of {name: string, items: string[]}), "nextSteps" (array of strings), and "risks" (array of strings). Return ONLY the JSON object.`,
    'decision-log': `Extract decisions from this content. Return a JSON array of objects with "decision" (string), "rationale" (string), "owner" (string), "date" (string or null), and "status" ("made"/"pending"/"revised"). Return ONLY the JSON array.`,
    'professional-bio': `Write a professional bio based on this information. Create 3 versions: short (1 sentence), medium (1 paragraph), and long (2-3 paragraphs). Return as JSON with keys "short", "medium", "long". Return ONLY the JSON object.`,
    'weekly-report': `Generate a weekly status report from this content. Include: 1) Summary of work completed, 2) Key metrics/achievements, 3) Issues encountered, 4) Plan for next week, 5) Blockers needing attention. Use markdown.`,
    'client-summary': `Create a client-facing summary of this content. Be professional, positive, and focus on value delivered. Include: progress, results, next steps. Avoid internal jargon.`,
  }

  const prompt = prompts[mode]
  if (!prompt) {
    return Response.json({ error: `Unknown mode: ${mode}` }, { status: 400 })
  }

  let response: string
  try {
    const systemMsg = context
      ? `You are a professional business assistant. Context: ${context}. Output only what is requested.`
      : 'You are a professional business assistant. Output only what is requested, no extra text.'
    response = await callLLM(
      [
        { role: 'system', content: systemMsg },
        { role: 'user', content: `${prompt}\n\nContent:\n${truncatedContent}` },
      ],
      { provider, apiKey }
    )
  } catch (err) {
    return Response.json({ error: `LLM error: ${err instanceof Error ? err.message : 'unknown'}` }, { status: 500 })
  }

  let result: unknown = response

  if (['action-items', 'presentation-outline', 'brainstorm', 'decision-log', 'professional-bio'].includes(mode)) {
    const jsonMatch = response.match(/\{[\s\S]*\}/) || response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      try { result = JSON.parse(jsonMatch[0]) } catch { result = response }
    }
  }

  return Response.json({ result, mode })
}
