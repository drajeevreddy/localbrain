'use client'

import { useState } from 'react'
import EmailDraft from './EmailDraft'
import ActionItems from './ActionItems'
import MeetingSummary from './MeetingSummary'
import ProjectStatus from './ProjectStatus'
import PresentationOutline from './PresentationOutline'
import ReportGenerator from './ReportGenerator'
import DecisionLog from './DecisionLog'

interface CorporateToolsProps {
  content: string
}

const tabs = [
  { id: 'email', label: 'Email' },
  { id: 'action-items', label: 'Actions' },
  { id: 'meeting', label: 'Meeting' },
  { id: 'status', label: 'Status' },
  { id: 'slides', label: 'Slides' },
  { id: 'reports', label: 'Reports' },
  { id: 'decisions', label: 'Decisions' },
] as const

export default function CorporateTools({ content }: CorporateToolsProps) {
  const [activeTab, setActiveTab] = useState<string>('email')

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
        {activeTab === 'email' && (
          <div className="space-y-4">
            <EmailDraft content={content} mode="email-draft" />
            <div className="border-t border-[rgba(255,255,255,0.06)] pt-4">
              <div className="text-xs text-[#464a4d] mb-2">Or draft a reply:</div>
              <EmailDraft content={content} mode="email-reply" />
            </div>
          </div>
        )}
        {activeTab === 'action-items' && <ActionItems content={content} />}
        {activeTab === 'meeting' && <MeetingSummary content={content} />}
        {activeTab === 'status' && <ProjectStatus content={content} />}
        {activeTab === 'slides' && <PresentationOutline content={content} />}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <ReportGenerator content={content} mode="weekly-report" label="Weekly Report" />
            <div className="border-t border-[rgba(255,255,255,0.06)] pt-4">
              <ReportGenerator content={content} mode="executive-summary" label="Executive Summary" />
            </div>
            <div className="border-t border-[rgba(255,255,255,0.06)] pt-4">
              <ReportGenerator content={content} mode="client-summary" label="Client Summary" />
            </div>
          </div>
        )}
        {activeTab === 'decisions' && <DecisionLog content={content} />}
      </div>
    </div>
  )
}
