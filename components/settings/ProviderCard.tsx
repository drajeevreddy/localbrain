'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'

interface ProviderCardProps {
  name: string
  enabled: boolean
  model: string
  hasKey: boolean
  models: string[]
  onToggle: (enabled: boolean) => void
  onModelChange: (model: string) => void
  onApiKeyChange: (key: string) => void
  onTest: () => Promise<{ success: boolean; message: string }>
}

export default function ProviderCard({
  name,
  enabled,
  model,
  hasKey,
  models,
  onToggle,
  onModelChange,
  onApiKeyChange,
  onTest,
}: ProviderCardProps) {
  const [apiKey, setApiKey] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const result = await onTest()
      setTestResult(result)
    } catch {
      setTestResult({ success: false, message: 'Test failed' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-[#fcfdff] font-medium capitalize">{name}</h3>
          <Badge variant={enabled ? 'success' : 'default'}>
            {enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
        <button
          onClick={() => onToggle(!enabled)}
          className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
            enabled ? 'bg-[#11ff99] shadow-[0_0_12px_rgba(17,255,153,0.3)]' : 'bg-[#464a4d]'
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              enabled ? 'translate-x-5' : ''
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="space-y-3 animate-fade-in-up">
          <div>
            <label className="text-xs text-[#a1a4a5] mb-1 block">Model</label>
            <select
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
              className="w-full bg-[#0a0a0c] text-[#fcfdff] border border-[rgba(255,255,255,0.14)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b9eff] focus:shadow-[0_0_12px_rgba(59,158,255,0.15)] transition-all duration-200"
            >
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="API Key"
            type="password"
            placeholder={hasKey ? '•••••••• (key saved)' : 'Enter API key'}
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value)
              onApiKeyChange(e.target.value)
            }}
          />

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleTest} disabled={testing}>
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
            {testResult && (
              <Badge variant={testResult.success ? 'success' : 'error'}>
                {testResult.message}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
