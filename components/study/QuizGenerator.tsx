'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
}

interface QuizGeneratorProps {
  content: string
}

export default function QuizGenerator({ content }: QuizGeneratorProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, mode: 'quiz' }),
      })
      if (res.ok) {
        const data = await res.json()
        setQuestions(data.result)
        setCurrent(0)
        setScore(0)
        setAnswered(0)
        setCompleted(false)
        toast.success(`Generated ${data.result.length} questions`)
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

  const handleAnswer = (index: number) => {
    if (showAnswer) return
    setSelected(index)
    setShowAnswer(true)
    setAnswered(answered + 1)
    if (index === questions[current].correctIndex) {
      setScore(score + 1)
    }
  }

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1)
      setSelected(null)
      setShowAnswer(false)
    } else {
      setCompleted(true)
    }
  }

  const reset = () => {
    setQuestions([])
    setCurrent(0)
    setSelected(null)
    setShowAnswer(false)
    setScore(0)
    setAnswered(0)
    setCompleted(false)
  }

  if (questions.length === 0) {
    return (
      <Button onClick={generate} disabled={loading || !content.trim()} size="sm">
        {loading ? 'Generating...' : 'Generate Quiz'}
      </Button>
    )
  }

  if (completed) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="space-y-4">
        <div className="p-6 rounded-xl border border-[rgba(255,255,255,0.14)] bg-[#0a0a0c] text-center">
          <div className="text-3xl font-medium mb-2" style={{ color: pct >= 70 ? '#11ff99' : '#ff2047' }}>
            {score}/{questions.length}
          </div>
          <div className="text-sm text-[#a1a4a5]">{pct}% correct</div>
          <div className="text-xs text-[#464a4d] mt-1">
            {pct >= 80 ? 'Great job!' : pct >= 60 ? 'Good effort!' : 'Keep studying!'}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={generate}>Retry</Button>
          <Button variant="ghost" size="sm" onClick={reset}>Clear</Button>
        </div>
      </div>
    )
  }

  const q = questions[current]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#a1a4a5]">Question {current + 1} of {questions.length}</span>
        <span className="text-xs text-[#11ff99]">Score: {score}</span>
      </div>

      <div className="p-5 rounded-xl border border-[rgba(255,255,255,0.14)] bg-[#0a0a0c]">
        <div className="text-sm text-[#fcfdff] mb-4 leading-relaxed">{q.question}</div>
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            let style = 'border-[rgba(255,255,255,0.14)] hover:border-[rgba(255,255,255,0.24)]'
            if (showAnswer) {
              if (i === q.correctIndex) style = 'border-[#11ff99] bg-[rgba(17,255,153,0.08)]'
              else if (i === selected && i !== q.correctIndex) style = 'border-[#ff2047] bg-[rgba(255,32,71,0.08)]'
            } else if (i === selected) {
              style = 'border-[#3b9eff]'
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={showAnswer}
                className={`w-full text-left p-3 rounded-lg border text-sm transition-all duration-200 ${style}`}
              >
                <span className="text-[#464a4d] mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            )
          })}
        </div>
      </div>

      {showAnswer && (
        <Button variant="ghost" size="sm" onClick={handleNext} className="w-full">
          {current < questions.length - 1 ? 'Next Question' : 'See Results'}
        </Button>
      )}

      <Button variant="ghost" size="sm" onClick={reset}>Clear Quiz</Button>
    </div>
  )
}
