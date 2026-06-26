'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface Flashcard {
  front: string
  back: string
}

interface FlashcardGeneratorProps {
  content: string
}

export default function FlashcardGenerator({ content }: FlashcardGeneratorProps) {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showExport, setShowExport] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, mode: 'flashcards' }),
      })
      if (res.ok) {
        const data = await res.json()
        setCards(data.result)
        setCurrent(0)
        setFlipped(false)
        toast.success(`Generated ${data.result.length} flashcards`)
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

  const exportToAnki = () => {
    const text = cards.map((c) => `${c.front}\t${c.back}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'flashcards.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded Anki-compatible file')
  }

  const exportToCSV = () => {
    const header = 'Front,Back\n'
    const rows = cards.map((c) => `"${c.front.replace(/"/g, '""')}","${c.back.replace(/"/g, '""')}"`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'flashcards.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded CSV file')
  }

  if (cards.length === 0) {
    return (
      <Button onClick={generate} disabled={loading || !content.trim()} size="sm">
        {loading ? 'Generating...' : 'Generate Flashcards'}
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#a1a4a5]">Card {current + 1} of {cards.length}</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowExport(!showExport)}>
            Export
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setCards([]); setCurrent(0) }}>
            Clear
          </Button>
        </div>
      </div>

      {showExport && (
        <div className="flex gap-2 animate-fade-in-up">
          <Button variant="ghost" size="sm" onClick={exportToAnki}>Anki (.txt)</Button>
          <Button variant="ghost" size="sm" onClick={exportToCSV}>CSV</Button>
        </div>
      )}

      <div
        onClick={() => setFlipped(!flipped)}
        className="min-h-[160px] p-6 rounded-xl border border-[rgba(255,255,255,0.14)] bg-[#0a0a0c] cursor-pointer flex items-center justify-center text-center transition-all duration-300 hover:border-[rgba(59,158,255,0.3)]"
      >
        <div>
          <div className="text-xs text-[#3b9eff] mb-3">{flipped ? 'Answer' : 'Question'}</div>
          <div className="text-sm text-[#fcfdff] leading-relaxed">
            {flipped ? cards[current].back : cards[current].front}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setCurrent(Math.max(0, current - 1)); setFlipped(false) }}
          disabled={current === 0}
        >
          Previous
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setCurrent(Math.min(cards.length - 1, current + 1)); setFlipped(false) }}
          disabled={current === cards.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
