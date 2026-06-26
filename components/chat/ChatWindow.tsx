'use client'

import { useState, useRef, useEffect } from 'react'
import Button from '@/components/ui/Button'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{ index: number; title: string; preview: string }>
}

interface ChatWindowProps {
  provider: string
  apiKey: string
}

export default function ChatWindow({ provider, apiKey }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          provider,
          apiKey,
        }),
      })

      if (!res.ok) throw new Error('Chat request failed')

      const reader = res.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      let fullContent = ''
      let sources: Message['sources'] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const sourceMatch = chunk.match(/__SOURCES__(\[.*\])/)

        if (sourceMatch) {
          sources = JSON.parse(sourceMatch[1])
          fullContent += chunk.split('__SOURCES__')[0]
        } else {
          fullContent += chunk
        }

        setMessages([
          ...newMessages,
          { role: 'assistant', content: fullContent, sources },
        ])
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-[#464a4d] text-sm">
            Ask a question about your notes...
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm transition-all duration-200 ${
                msg.role === 'user'
                  ? 'bg-[#101012] text-[#fcfdff] border border-[rgba(255,255,255,0.14)]'
                  : 'bg-[#0a0a0c] text-[rgba(252,253,255,0.86)]'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] space-y-1">
                  <p className="text-xs font-medium text-[#a1a4a5]">Sources:</p>
                  {msg.sources.map((s) => (
                    <div key={s.index} className="text-xs text-[#888e90]">
                      <span className="text-[#3b9eff]">[{s.index}]</span> {s.title} — {s.preview}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="bg-[#0a0a0c] rounded-xl px-4 py-3 text-sm flex items-center gap-1.5">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-[rgba(255,255,255,0.06)]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask about your notes..."
            className="flex-1 bg-[#0a0a0c] text-[#fcfdff] border border-[rgba(255,255,255,0.14)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#3b9eff] focus:shadow-[0_0_12px_rgba(59,158,255,0.15)] placeholder:text-[#464a4d] transition-all duration-200"
          />
          <Button onClick={sendMessage} disabled={loading || !input.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
