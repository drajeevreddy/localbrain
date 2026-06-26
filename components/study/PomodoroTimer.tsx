'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Button from '@/components/ui/Button'

export default function PomodoroTimer() {
  const [mode, setMode] = useState<'work' | 'break'>('work')
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const workDuration = 25 * 60
  const breakDuration = 5 * 60

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            if (mode === 'work') {
              setSessions((s) => s + 1)
              setMode('break')
              return breakDuration
            } else {
              setMode('work')
              return workDuration
            }
          }
          return t - 1
        })
      }, 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, mode])

  const toggle = useCallback(() => setRunning((r) => !r), [])
  const reset = useCallback(() => { setRunning(false); setTimeLeft(workDuration); setMode('work') }, [])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = mode === 'work'
    ? ((workDuration - timeLeft) / workDuration) * 100
    : ((breakDuration - timeLeft) / breakDuration) * 100

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
            <circle
              cx="18" cy="18" r="16" fill="none"
              stroke={mode === 'work' ? '#3b9eff' : '#11ff99'}
              strokeWidth="2"
              strokeDasharray={`${progress} 100`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-[#fcfdff]">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex gap-1">
          <Button variant={running ? 'ghost' : 'primary'} size="sm" onClick={toggle}>
            {running ? 'Pause' : 'Start'}
          </Button>
          <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
        </div>
        <div className="text-[10px] text-[#464a4d]">
          {mode === 'work' ? 'Focus' : 'Break'} · {sessions} sessions
        </div>
      </div>
    </div>
  )
}
