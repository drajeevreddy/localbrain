'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface ActionItem {
  task: string
  assignee: string
  priority: string
  deadline: string | null
}

interface ActionItemsProps {
  content: string
}

export default function ActionItems({ content }: ActionItemsProps) {
  const [items, setItems] = useState<ActionItem[]>([])
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/corporate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, mode: 'action-items' }),
      })
      if (res.ok) {
        const data = await res.json()
        setItems(data.result)
        toast.success(`Found ${data.result.length} action items`)
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed')
      }
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  const copyToClipboard = () => {
    const text = items.map((item, i) =>
      `${i + 1}. [${item.priority.toUpperCase()}] ${item.task} — ${item.assignee}${item.deadline ? ` (due: ${item.deadline})` : ''}`
    ).join('\n')
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const priorityColor = (p: string) => {
    if (p === 'high') return '#ff2047'
    if (p === 'medium') return '#ffc53d'
    return '#11ff99'
  }

  if (items.length > 0) {
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="p-3 rounded-lg bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)]">
              <div className="flex items-start gap-2">
                <span className="shrink-0 w-2 h-2 mt-1.5 rounded-full" style={{ background: priorityColor(item.priority) }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#fcfdff]">{item.task}</div>
                  <div className="flex gap-3 mt-1 text-xs text-[#464a4d]">
                    <span>{item.assignee}</span>
                    {item.deadline && <span>Due: {item.deadline}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={copyToClipboard}>Copy</Button>
          <Button variant="ghost" size="sm" onClick={generate}>Regenerate</Button>
          <Button variant="ghost" size="sm" onClick={() => setItems([])}>Clear</Button>
        </div>
      </div>
    )
  }

  return (
    <Button onClick={generate} disabled={loading || !content.trim()} size="sm">
      {loading ? 'Extracting...' : 'Extract Action Items'}
    </Button>
  )
}
