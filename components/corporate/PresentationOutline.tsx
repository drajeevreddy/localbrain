'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface Slide {
  title: string
  bullets: string[]
  speakerNotes: string
}

interface PresentationOutlineProps {
  content: string
}

export default function PresentationOutline({ content }: PresentationOutlineProps) {
  const [slides, setSlides] = useState<Slide[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/corporate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, mode: 'presentation-outline' }),
      })
      if (res.ok) {
        const data = await res.json()
        setSlides(data.result)
        toast.success(`Created ${data.result.length} slides`)
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed')
      }
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  const copyToClipboard = () => {
    const text = slides.map((s, i) =>
      `Slide ${i + 1}: ${s.title}\n${s.bullets.map(b => `  • ${b}`).join('\n')}\nNotes: ${s.speakerNotes}`
    ).join('\n\n')
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const exportMarkdown = () => {
    const md = slides.map((s, i) =>
      `## Slide ${i + 1}: ${s.title}\n\n${s.bullets.map(b => `- ${b}`).join('\n')}\n\n<!-- Speaker Notes: ${s.speakerNotes} -->`
    ).join('\n\n---\n\n')
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'presentation-outline.md'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded')
  }

  if (slides.length > 0) {
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          {slides.map((slide, i) => (
            <div key={i} className="rounded-lg border border-[rgba(255,255,255,0.14)] overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full text-left px-4 py-3 bg-[#0a0a0c] flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#3b9eff] font-mono">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-sm text-[#fcfdff]">{slide.title}</span>
                </div>
                <span className="text-[#464a4d] text-xs">{expanded === i ? '−' : '+'}</span>
              </button>
              {expanded === i && (
                <div className="px-4 py-3 bg-[#06060a] animate-fade-in-up">
                  <ul className="space-y-1 mb-3">
                    {slide.bullets.map((b, j) => (
                      <li key={j} className="text-xs text-[rgba(252,253,255,0.86)] flex gap-2">
                        <span className="text-[#464a4d]">•</span>{b}
                      </li>
                    ))}
                  </ul>
                  <div className="text-xs text-[#464a4d] border-t border-[rgba(255,255,255,0.06)] pt-2">
                    <span className="text-[#a1a4a5]">Speaker notes:</span> {slide.speakerNotes}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={copyToClipboard}>Copy</Button>
          <Button variant="ghost" size="sm" onClick={exportMarkdown}>Export MD</Button>
          <Button variant="ghost" size="sm" onClick={generate}>Regenerate</Button>
          <Button variant="ghost" size="sm" onClick={() => setSlides([])}>Clear</Button>
        </div>
      </div>
    )
  }

  return (
    <Button onClick={generate} disabled={loading || !content.trim()} size="sm">
      {loading ? 'Creating...' : 'Create Presentation Outline'}
    </Button>
  )
}
