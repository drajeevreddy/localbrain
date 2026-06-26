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

  try {
    return { provider: active.name || data.default_provider, apiKey: decrypt(active.apiKey) }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser()
  if (error) return error

  const body = await request.json()
  const { query, messages } = body as {
    query: string
    messages: Array<{ role: string; content: string }>
  }

  if (!query) {
    return Response.json({ error: 'Missing query' }, { status: 400 })
  }

  const supabase = await createClient()

  const creds = await getUserApiKey(supabase, user!.id)
  if (!creds) {
    return Response.json({ error: 'No LLM provider configured. Go to Settings and add an API key.' }, { status: 400 })
  }

  const { provider, apiKey } = creds

  let queryEmbedding: number[]
  try {
    queryEmbedding = await callEmbedding(query, { provider, apiKey })
  } catch {
    return Response.json({ error: 'Failed to embed query. Check your provider API key.' }, { status: 500 })
  }

  let similarChunks: Array<{ content: string; note_id: string; notes?: unknown }> = []

  const rpcResult = await supabase.rpc('match_chunks', {
    query_embedding: JSON.stringify(queryEmbedding),
    match_count: 5,
    user_id_input: user!.id,
  })

  if (rpcResult.data && Array.isArray(rpcResult.data) && rpcResult.data.length > 0) {
    similarChunks = rpcResult.data as Array<{ content: string; note_id: string; notes?: unknown }>
  } else {
    const fallbackResult = await supabase
      .from('chunks')
      .select('id, content, note_id, notes(title)')
      .eq('user_id', user!.id)
      .not('embedding', 'is', null)
      .limit(5)

    if (fallbackResult.data) {
      similarChunks = fallbackResult.data as Array<{ content: string; note_id: string; notes?: unknown }>
    }
  }

  const contextChunks = similarChunks
  const context = contextChunks
    .map((c, i) => {
      const notes = c.notes as { title?: string } | undefined
      return `[Source ${i + 1}: ${notes?.title ?? 'Unknown'}]\n${c.content}`
    })
    .join('\n\n')

  const systemMessage = {
    role: 'system',
    content: context
      ? `You are a helpful assistant that answers questions based on the user's notes. Use the provided context to answer. If the context doesn't contain enough information, say so. Always cite your sources using [Source N] format.\n\nContext:\n${context}`
      : 'You are a helpful assistant. The user has no ingested notes yet, so answer based on general knowledge.',
  }

  const allMessages = [systemMessage, ...messages.slice(-10), { role: 'user', content: query }]

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const baseUrl = getProviderBaseUrl(provider)
        const isGemini = provider === 'gemini'

        const res = await fetch(
          isGemini
            ? `https://generativelanguage.googleapis.com/v1beta/models/${getDefaultModel(provider)}:streamGenerateContent?alt=sse&key=${apiKey}`
            : `${baseUrl}/chat/completions`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
              ...(provider === 'openrouter' ? { 'HTTP-Referer': 'https://www.localbrain.in' } : {}),
            },
            body: JSON.stringify({
              model: getDefaultModel(provider),
              messages: allMessages,
              stream: true,
              max_tokens: 2048,
            }),
          }
        )

        if (!res.ok) {
          const errText = await res.text()
          controller.enqueue(encoder.encode(`Error from ${provider}: ${res.status} ${errText.slice(0, 200)}`))
          controller.close()
          return
        }

        const reader = res.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              if (data === '[DONE]') {
                const sources = contextChunks.map((c, i) => {
                  const notes = c.notes as { title?: string } | undefined
                  return {
                    index: i + 1,
                    title: notes?.title ?? 'Unknown',
                    preview: c.content.slice(0, 150),
                  }
                })
                controller.enqueue(
                  encoder.encode(`\n\n__SOURCES__${JSON.stringify(sources)}`)
                )
                controller.close()
                return
              }
              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content
                if (content) {
                  controller.enqueue(encoder.encode(content))
                }
              } catch {
                // skip malformed JSON
              }
            }
          }
        }

        controller.close()
      } catch (err) {
        controller.enqueue(
          encoder.encode(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}

function getProviderBaseUrl(provider: ProviderName): string {
  const urls: Record<string, string> = {
    nvidia: 'https://integrate.api.nvidia.com/v1',
    groq: 'https://api.groq.com/openai/v1',
    openrouter: 'https://openrouter.ai/api/v1',
    together: 'https://api.together.xyz/v1',
    cerebras: 'https://api.cerebras.ai/v1',
    ollama: 'http://localhost:11434/v1',
    mistral: 'https://api.mistral.ai/v1',
    huggingface: 'https://api-inference.huggingface.co',
    cohere: 'https://api.cohere.com',
  }
  return urls[provider] ?? urls.nvidia
}

function getDefaultModel(provider: ProviderName): string {
  const models: Record<string, string> = {
    nvidia: 'meta/llama-3.1-8b-instruct',
    groq: 'llama-3.1-8b-instant',
    gemini: 'gemini-1.5-flash',
    openrouter: 'mistralai/mistral-7b-instruct:free',
    cohere: 'command-r',
    ollama: 'llama3.1',
    together: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
    cerebras: 'llama3.1-8b',
    huggingface: 'mistralai/Mistral-7B-Instruct-v0.3',
    mistral: 'mistral-small-latest',
  }
  return models[provider] ?? 'meta/llama-3.1-8b-instruct'
}
