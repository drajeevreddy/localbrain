'use client'

import { useState } from 'react'
import FlashcardGenerator from './FlashcardGenerator'
import QuizGenerator from './QuizGenerator'
import StudySummary from './StudySummary'
import KeyPoints from './KeyPoints'

interface StudyToolsProps {
  content: string
}

const tabs = [
  { id: 'summary', label: 'Summary' },
  { id: 'key-points', label: 'Key Points' },
  { id: 'flashcards', label: 'Flashcards' },
  { id: 'quiz', label: 'Quiz' },
] as const

export default function StudyTools({ content }: StudyToolsProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'key-points' | 'flashcards' | 'quiz'>('summary')

  return (
    <div className="border-t border-[rgba(255,255,255,0.06)]">
      <div className="flex gap-1 px-4 md:px-6 py-2 border-b border-[rgba(255,255,255,0.06)] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-[#101012] text-[#fcfdff]'
                : 'text-[#464a4d] hover:text-[#a1a4a5]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4 md:p-6">
        {activeTab === 'summary' && <StudySummary content={content} />}
        {activeTab === 'key-points' && <KeyPoints content={content} />}
        {activeTab === 'flashcards' && <FlashcardGenerator content={content} />}
        {activeTab === 'quiz' && <QuizGenerator content={content} />}
      </div>
    </div>
  )
}
