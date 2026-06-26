import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/crypto'

export async function GET() {
  const { user, error } = await getAuthenticatedUser()
  if (error) return error

  const supabase = await createClient()

  const { data, error: fetchError } = await supabase
    .from('user_settings')
    .select('id, provider_configs, default_provider')
    .eq('user_id', user!.id)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    return Response.json({ error: fetchError.message }, { status: 500 })
  }

  if (!data) {
    return Response.json({
      provider_configs: [],
      default_provider: 'nvidia',
    })
  }

  // Decrypt API keys for display (masked)
  const configs = Array.isArray(data.provider_configs) ? data.provider_configs : []
  const maskedConfigs = configs.map((c: { name: string; apiKey?: string; enabled?: boolean; model?: string }) => ({
    name: c.name,
    enabled: c.enabled ?? true,
    model: c.model ?? '',
    apiKey: c.apiKey ? '••••••••' : '',
    hasKey: !!c.apiKey,
  }))

  return Response.json({
    provider_configs: maskedConfigs,
    default_provider: data.default_provider,
  })
}

export async function PUT(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser()
  if (error) return error

  const body = await request.json()
  const { provider_configs, default_provider } = body as {
    provider_configs: Array<{
      name: string
      apiKey?: string
      enabled?: boolean
      model?: string
    }>
    default_provider: string
  }

  const supabase = await createClient()

  // Encrypt API keys before storing
  const encryptedConfigs = provider_configs.map((c) => ({
    ...c,
    apiKey: c.apiKey && c.apiKey !== '••••••••' ? encrypt(c.apiKey) : c.apiKey,
  }))

  const { error: upsertError } = await supabase
    .from('user_settings')
    .upsert(
      {
        user_id: user!.id,
        provider_configs: encryptedConfigs,
        default_provider,
      },
      { onConflict: 'user_id' }
    )

  if (upsertError) {
    return Response.json({ error: upsertError.message }, { status: 500 })
  }

  return Response.json({ success: true })
}

export async function POST(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser()
  if (error) return error

  const body = await request.json()
  const { provider, apiKey } = body as { provider: string; apiKey: string }

  if (!provider || !apiKey) {
    return Response.json({ error: 'Missing provider or apiKey' }, { status: 400 })
  }

  // Test the connection by making a simple request
  const testUrls: Record<string, string> = {
    nvidia: 'https://integrate.api.nvidia.com/v1/models',
    groq: 'https://api.groq.com/openai/v1/models',
    openrouter: 'https://openrouter.ai/api/v1/models',
    together: 'https://api.together.xyz/v1/models',
    cerebras: 'https://api.cerebras.ai/v1/models',
    ollama: 'http://localhost:11434/api/tags',
  }

  const url = testUrls[provider]
  if (!url) {
    return Response.json({ error: 'Unknown provider' }, { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    return Response.json({
      success: res.ok,
      status: res.status,
      message: res.ok ? 'Connection successful' : `Failed: ${res.status}`,
    })
  } catch (err) {
    return Response.json({
      success: false,
      message: err instanceof Error ? err.message : 'Connection failed',
    })
  }
}
