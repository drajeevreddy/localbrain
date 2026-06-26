'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface StudySummaryProps {
  content: string
}

export default function StudySummary({ content }: StudySummaryProps) {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, mode: 'summary' }),
      })
      if (res.ok) {
        const data = await res.json()
        setSummary(data.result)
        toast.success('Summary generated')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to generate')
      }
    } catch {
      toast.error('Failed to generate')
    } finally {
      setLoading(false)
    }
  }

  if (summary) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-[rgba(252,253,255,0.86)] leading-relaxed whitespace-pre-wrap">{summary}</div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={generate}>Regenerate</Button>
          <Button variant="ghost" size="sm" onClick={() => setSummary('')}>Clear</Button>
        </div>
      </div>
    )
  }

  return (
    <Button onClick={generate} disabled={loading || !content.trim()} size="sm">
      {loading ? 'Generating...' : 'Generate Study Summary'}
    </Button>
  )
}
