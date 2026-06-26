'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface SearchResult {
  id: string
  title: string
  content: string
  score: number
}

interface SmartSearchProps {
  onNavigate: (noteId: string) => void
}

export default function SmartSearch({ onNavigate }: SmartSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      if (res.ok) {
        const data = await res.json()
        setResults(data.results)
        setShow(true)
      }
    } catch { toast.error('Search failed') } finally { setLoading(false) }
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="Smart search..."
          className="flex-1 bg-[#0a0a0c] text-[#fcfdff] border border-[rgba(255,255,255,0.14)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b9eff] focus:shadow-[0_0_12px_rgba(59,158,255,0.15)] placeholder:text-[#464a4d] transition-all duration-200"
        />
        <Button onClick={search} disabled={loading || !query.trim()} size="sm">
          {loading ? '...' : 'Search'}
        </Button>
      </div>

      {show && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)] rounded-lg z-50 animate-fade-in-up shadow-xl max-h-80 overflow-auto">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => { onNavigate(r.id); setShow(false); setQuery(''); setResults([]) }}
              className="w-full text-left px-4 py-3 hover:bg-[#101012] transition-colors border-b border-[rgba(255,255,255,0.06)] last:border-0"
            >
              <div className="text-sm text-[#fcfdff] font-medium">{r.title}</div>
              <div className="text-xs text-[#464a4d] mt-0.5 line-clamp-2">{r.content}</div>
            </button>
          ))}
        </div>
      )}

      {show && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)] rounded-lg p-4 z-50 text-center text-xs text-[#464a4d]">
          No results found
        </div>
      )}
    </div>
  )
}
