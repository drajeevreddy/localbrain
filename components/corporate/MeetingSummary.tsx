'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface MeetingSummaryProps {
  content: string
}

export default function MeetingSummary({ content }: MeetingSummaryProps) {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/corporate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, mode: 'meeting-summary' }),
      })
      if (res.ok) {
        const data = await res.json()
        setSummary(data.result)
        toast.success('Summary generated')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed')
      }
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary)
    toast.success('Copied to clipboard')
  }

  if (summary) {
    return (
      <div className="space-y-3">
        <div className="p-4 rounded-xl bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)] text-sm text-[rgba(252,253,255,0.86)] whitespace-pre-wrap leading-relaxed">
          {summary}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={copyToClipboard}>Copy</Button>
          <Button variant="ghost" size="sm" onClick={generate}>Regenerate</Button>
          <Button variant="ghost" size="sm" onClick={() => setSummary('')}>Clear</Button>
        </div>
      </div>
    )
  }

  return (
    <Button onClick={generate} disabled={loading || !content.trim()} size="sm">
      {loading ? 'Generating...' : 'Generate Meeting Summary'}
    </Button>
  )
}
