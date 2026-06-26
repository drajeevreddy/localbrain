'use client'

import { useState, useEffect, useCallback } from 'react'
import ProviderCard from '@/components/settings/ProviderCard'

const ALL_PROVIDERS = [
  { name: 'nvidia', models: ['meta/llama-3.1-8b-instruct', 'meta/llama-3.1-70b-instruct'] },
  { name: 'groq', models: ['llama-3.1-8b-instant', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768'] },
  { name: 'gemini', models: ['gemini-1.5-flash', 'gemini-1.5-pro'] },
  { name: 'openrouter', models: ['mistralai/mistral-7b-instruct:free', 'google/gemma-2-9b-it:free', 'meta-llama/llama-3.1-8b-instruct:free'] },
  { name: 'together', models: ['meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo', 'mistralai/Mixtral-8x7B-Instruct-v0.1'] },
  { name: 'cohere', models: ['command-r', 'command-r-plus'] },
  { name: 'cerebras', models: ['llama3.1-8b', 'llama3.1-70b'] },
  { name: 'huggingface', models: ['mistralai/Mistral-7B-Instruct-v0.3'] },
  { name: 'ollama', models: ['llama3.1', 'mistral', 'codellama'] },
]

interface ProviderConfig {
  name: string
  enabled: boolean
  model: string
  apiKey: string
  hasKey: boolean
}

function buildDefaultConfigs(): ProviderConfig[] {
  return ALL_PROVIDERS.map((p) => ({
    name: p.name,
    enabled: p.name === 'nvidia',
    model: p.models[0],
    apiKey: '',
    hasKey: false,
  }))
}

function mergeConfigs(saved: ProviderConfig[], defaults: ProviderConfig[]): ProviderConfig[] {
  return defaults.map((def) => {
    const s = saved.find((c) => c.name === def.name)
    return s ? { ...def, ...s, model: s.model || def.model } : def
  })
}

export default function SettingsPage() {
  const [configs, setConfigs] = useState<ProviderConfig[]>(buildDefaultConfigs)
  const [defaultProvider, setDefaultProvider] = useState('nvidia')
  const [saving, setSaving] = useState(false)

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        const saved = Array.isArray(data.provider_configs) ? data.provider_configs : []
        setConfigs(mergeConfigs(saved, buildDefaultConfigs()))
        setDefaultProvider(data.default_provider || 'nvidia')
      }
    } catch {
      // Keep defaults on error
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleToggle = (name: string, enabled: boolean) => {
    setConfigs(configs.map((c) => (c.name === name ? { ...c, enabled } : c)))
  }

  const handleModelChange = (name: string, model: string) => {
    setConfigs(configs.map((c) => (c.name === name ? { ...c, model } : c)))
  }

  const handleApiKeyChange = (name: string, apiKey: string) => {
    setConfigs(configs.map((c) => (c.name === name ? { ...c, apiKey } : c)))
  }

  const handleTest = async (name: string, apiKey: string) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: name, apiKey }),
    })
    return res.json()
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_configs: configs.map((c) => ({
            name: c.name,
            apiKey: c.apiKey && c.apiKey !== '••••••••' ? c.apiKey : undefined,
            enabled: c.enabled,
            model: c.model,
          })),
          default_provider: defaultProvider,
        }),
      })
    } finally {
      setSaving(false)
    }
  }

  const activeProvider = configs.find((c) => c.enabled && c.hasKey)?.name ?? defaultProvider

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-medium mb-2">Settings</h1>
      <p className="text-sm text-[#a1a4a5] mb-8">Configure your LLM providers and API keys.</p>

      <div className="mb-6">
        <label className="text-sm text-[#a1a4a5] block mb-2">Default Provider</label>
        <select
          value={activeProvider}
          onChange={(e) => setDefaultProvider(e.target.value)}
          className="w-full bg-[#0a0a0c] text-[#fcfdff] border border-[rgba(255,255,255,0.14)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b9eff] focus:shadow-[0_0_12px_rgba(59,158,255,0.15)] transition-all duration-200"
        >
          {ALL_PROVIDERS.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {configs.map((config) => {
          const providerDef = ALL_PROVIDERS.find((p) => p.name === config.name)
          return (
            <ProviderCard
              key={config.name}
              name={config.name}
              enabled={config.enabled}
              model={config.model}
              hasKey={config.hasKey}
              models={providerDef?.models ?? []}
              onToggle={(enabled) => handleToggle(config.name, enabled)}
              onModelChange={(model) => handleModelChange(config.name, model)}
              onApiKeyChange={(key) => handleApiKeyChange(config.name, key)}
              onTest={() => handleTest(config.name, config.apiKey)}
            />
          )
        })}
      </div>

      <div className="mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-9 px-4 text-sm font-medium bg-white text-black rounded-md hover:bg-[#f1f7fe] transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
