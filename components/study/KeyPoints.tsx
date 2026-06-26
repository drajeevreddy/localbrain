'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface KeyPointsProps {
  content: string
}

export default function KeyPoints({ content }: KeyPointsProps) {
  const [points, setPoints] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, mode: 'key-points' }),
      })
      if (res.ok) {
        const data = await res.json()
        setPoints(data.result)
        toast.success(`Extracted ${data.result.length} key points`)
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to extract')
      }
    } catch {
      toast.error('Failed to extract')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(points.map((p, i) => `${i + 1}. ${p}`).join('\n'))
    toast.success('Copied to clipboard')
  }

  if (points.length > 0) {
    return (
      <div className="space-y-3">
        <ul className="space-y-2">
          {points.map((p, i) => (
            <li key={i} className="flex gap-2 text-sm text-[rgba(252,253,255,0.86)]">
              <span className="text-[#3b9eff] font-medium shrink-0">{i + 1}.</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={copyToClipboard}>Copy</Button>
          <Button variant="ghost" size="sm" onClick={generate}>Regenerate</Button>
          <Button variant="ghost" size="sm" onClick={() => setPoints([])}>Clear</Button>
        </div>
      </div>
    )
  }

  return (
    <Button onClick={generate} disabled={loading || !content.trim()} size="sm">
      {loading ? 'Extracting...' : 'Extract Key Points'}
    </Button>
  )
}
