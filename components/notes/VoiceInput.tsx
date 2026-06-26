'use client'

import { useState, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'

interface VoiceInputProps {
  onTranscript: (text: string) => void
}

export default function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<any>(null)

  const toggleRecording = useCallback(() => {
    if (recording) {
      recognitionRef.current?.stop()
      setRecording(false)
      return
    }

    const w = window as any
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + ' ' + finalTranscript)
        onTranscript(finalTranscript)
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setRecording(false)
      if (event.error !== 'no-speech') {
        toast.error('Speech recognition error')
      }
    }

    recognition.onend = () => {
      setRecording(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setRecording(true)
    toast.success('Recording started. Speak now...')
  }, [recording, onTranscript])

  return (
    <button
      onClick={toggleRecording}
      className={`p-1.5 rounded-lg transition-all duration-200 ${
        recording
          ? 'bg-[rgba(255,32,71,0.15)] text-[#ff2047] animate-pulse'
          : 'hover:bg-[#101012] text-[#464a4d] hover:text-[#a1a4a5]'
      }`}
      title={recording ? 'Stop recording' : 'Voice input'}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </button>
  )
}
