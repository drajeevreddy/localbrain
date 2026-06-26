'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface Decision {
  decision: string
  rationale: string
  owner: string
  date: string | null
  status: string
}

interface DecisionLogProps {
  content: string
}

export default function DecisionLog({ content }: DecisionLogProps) {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/corporate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, mode: 'decision-log' }),
      })
      if (res.ok) {
        const data = await res.json()
        setDecisions(data.result)
        toast.success(`Found ${data.result.length} decisions`)
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed')
      }
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  const copyToClipboard = () => {
    const text = decisions.map((d, i) =>
      `${i + 1}. ${d.decision}\n   Rationale: ${d.rationale}\n   Owner: ${d.owner}\n   Status: ${d.status}${d.date ? `\n   Date: ${d.date}` : ''}`
    ).join('\n\n')
    navigator.clipboard.writeText(text)
    toast.success('Copied')
  }

  const statusColor = (s: string) => {
    if (s === 'made') return '#11ff99'
    if (s === 'pending') return '#ffc53d'
    return '#3b9eff'
  }

  if (decisions.length > 0) {
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          {decisions.map((d, i) => (
            <div key={i} className="p-3 rounded-lg bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)]">
              <div className="flex items-start gap-2">
                <span className="shrink-0 w-2 h-2 mt-1.5 rounded-full" style={{ background: statusColor(d.status) }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#fcfdff]">{d.decision}</div>
                  <div className="text-xs text-[#464a4d] mt-1">{d.rationale}</div>
                  <div className="flex gap-3 mt-1 text-xs text-[#464a4d]">
                    <span>{d.owner}</span>
                    <span className="capitalize">{d.status}</span>
                    {d.date && <span>{d.date}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={copyToClipboard}>Copy</Button>
          <Button variant="ghost" size="sm" onClick={generate}>Regenerate</Button>
          <Button variant="ghost" size="sm" onClick={() => setDecisions([])}>Clear</Button>
        </div>
      </div>
    )
  }

  return (
    <Button onClick={generate} disabled={loading || !content.trim()} size="sm">
      {loading ? 'Extracting...' : 'Extract Decisions'}
    </Button>
  )
}
