'use client'

import { useState, useEffect } from 'react'
import ChatWindow from '@/components/chat/ChatWindow'

export default function ChatPage() {
  const [provider, setProvider] = useState('nvidia')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        const active = data.provider_configs?.find(
          (c: { enabled: boolean; hasKey: boolean }) => c.enabled && c.hasKey
        )
        if (active) {
          setProvider(active.name)
          setApiKey('exists')
        }
      }
      setLoading(false)
    }
    fetchSettings()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-[#464a4d]">
        Loading...
      </div>
    )
  }

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full text-[#464a4d]">
        <div className="text-center">
          <p className="text-sm mb-2">No LLM provider configured.</p>
          <a href="/app/settings" className="text-sm text-[#3b9eff] hover:underline">
            Go to Settings
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <ChatWindow provider={provider} apiKey={apiKey} />
    </div>
  )
}
