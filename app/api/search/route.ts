import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/crypto'
import { callLLM, callEmbedding } from '@/lib/llm/adapter'
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
  const { query } = body as { query: string }

  if (!query) {
    return Response.json({ error: 'Missing query' }, { status: 400 })
  }

  const supabase = await createClient()
  const creds = await getUserApiKey(supabase, user!.id)

  let queryEmbedding: number[] | null = null
  if (creds) {
    try {
      queryEmbedding = await callEmbedding(query, creds)
    } catch {}
  }

  let results: Array<{ id: string; title: string; content: string; score: number }> = []

  if (queryEmbedding) {
    const { data } = await supabase.rpc('match_chunks', {
      query_embedding: JSON.stringify(queryEmbedding),
      match_count: 10,
      user_id_input: user!.id,
    })
    if (data && Array.isArray(data)) {
      const seen = new Set<string>()
      for (const chunk of data) {
        if (!seen.has(chunk.note_id)) {
          seen.add(chunk.note_id)
          const { data: note } = await supabase.from('notes').select('id, title, content').eq('id', chunk.note_id).single()
          if (note) {
            results.push({ id: note.id, title: note.title, content: note.content.slice(0, 200), score: 1 })
          }
        }
      }
    }
  }

  if (results.length === 0) {
    const { data } = await supabase
      .from('notes')
      .select('id, title, content')
      .eq('user_id', user!.id)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(10)

    if (data) {
      results = data.map((n) => ({ id: n.id, title: n.title, content: n.content.slice(0, 200), score: 0.5 }))
    }
  }

  return Response.json({ results })
}
