'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

interface NoteTemplatesProps {
  onSelect: (title: string, content: string) => void
}

const templates = [
  { category: 'Students', items: [
    { name: 'Lecture Notes', title: 'Lecture: [Topic]', content: `# Lecture Notes\n\n## Date: ${new Date().toLocaleDateString()}\n\n## Key Concepts\n\n\n\n## Details\n\n\n\n## Questions\n\n\n\n## Summary\n\n` },
    { name: 'Study Guide', title: 'Study Guide: [Topic]', content: `# Study Guide\n\n## Overview\n\n\n\n## Key Terms\n\n| Term | Definition |\n|------|------------|\n|      |            |\n\n## Formulas / Rules\n\n\n\n## Practice Questions\n\n1. \n2. \n3. \n\n## Notes\n\n` },
    { name: 'Research Notes', title: 'Research: [Topic]', content: `# Research Notes\n\n## Research Question\n\n\n\n## Sources\n\n1. \n2. \n3. \n\n## Key Findings\n\n\n\n## Analysis\n\n\n\n## Conclusions\n\n\n\n## References\n\n` },
    { name: 'Book Notes', title: 'Book: [Title]', content: `# Book Notes\n\n**Author:** \n**Rating:** /5\n\n## Summary\n\n\n\n## Key Takeaways\n\n1. \n2. \n3. \n\n## Favorite Quotes\n\n> \n\n## How I'll Apply This\n\n\n` },
  ]},
  { category: 'Corporate', items: [
    { name: 'Meeting Notes', title: 'Meeting: [Topic]', content: `# Meeting Notes\n\n**Date:** ${new Date().toLocaleDateString()}\n**Attendees:** \n**Location:** \n\n## Agenda\n\n1. \n2. \n\n## Discussion Notes\n\n### Item 1\n\n\n\n### Item 2\n\n\n\n## Key Decisions\n\n1. \n2. \n\n## Action Items\n\n| Task | Owner | Due | Priority |\n|------|-------|-----|----------|\n|      |       |     |          |\n\n## Next Meeting\n\n**Date:** \n**Agenda:** \n` },
    { name: 'Project Brief', title: 'Project: [Name]', content: `# Project Brief\n\n## Overview\n\n**Project Name:** \n**Sponsor:** \n**Start Date:** \n**Target Date:** \n\n## Objectives\n\n1. \n2. \n\n## Scope\n\n### In Scope\n\n- \n\n### Out of Scope\n\n- \n\n## Stakeholders\n\n| Name | Role | Interest |\n|------|------|----------|\n|      |      |          |\n\n## Requirements\n\n1. \n2. \n\n## Risks\n\n| Risk | Impact | Mitigation |\n|------|--------|------------|\n|      |        |            |\n\n## Budget\n\n**Estimated Cost:** \n**Approved Budget:** \n` },
    { name: 'Sprint Retrospective', title: 'Retro: Sprint [N]', content: `# Sprint Retrospective\n\n**Sprint:** \n**Date:** ${new Date().toLocaleDateString()}\n**Team:** \n\n## What Went Well\n\n- \n\n## What Could Improve\n\n- \n\n## Action Items\n\n- [ ] \n\n## Velocity\n\n**Committed:** \n**Completed:** \n**Carry Over:** \n` },
    { name: '1:1 Meeting', title: '1:1: [Person]', content: `# 1:1 Meeting Notes\n\n**With:** \n**Date:** ${new Date().toLocaleDateString()}\n\n## Updates\n\n### From Me\n\n- \n\n### From Them\n\n- \n\n## Discussion Topics\n\n1. \n2. \n\n## Action Items\n\n- [ ] \n\n## Feedback\n\n**Given:** \n\n**Received:** \n\n## Next 1:1\n\n**Date:** \n` },
    { name: 'Client Proposal', title: 'Proposal: [Client]', content: `# Client Proposal\n\n**Client:** \n**Date:** ${new Date().toLocaleDateString()}\n**Prepared by:** \n\n## Executive Summary\n\n\n\n## Problem Statement\n\n\n\n## Proposed Solution\n\n\n\n## Deliverables\n\n| Deliverable | Timeline | Price |\n|-------------|----------|-------|\n|             |          |       |\n\n## Timeline\n\n**Phase 1:** \n**Phase 2:** \n**Phase 3:** \n\n## Investment\n\n**Total:** \n\n## Why Us\n\n\n\n## Next Steps\n\n\n` },
    { name: 'Weekly Report', title: 'Weekly Report: Week [N]', content: `# Weekly Report\n\n**Week:** \n**Author:** \n**Date:** ${new Date().toLocaleDateString()}\n\n## Summary\n\n\n\n## Accomplishments\n\n- \n\n## In Progress\n\n- \n\n## Blockers\n\n- \n\n## Next Week\n\n- \n\n## Metrics\n\n| Metric | Target | Actual |\n|--------|--------|--------|\n|        |        |        |\n` },
  ]},
  { category: 'General', items: [
    { name: 'Blank', title: 'Untitled', content: '' },
  ]},
]

export default function NoteTemplates({ onSelect }: NoteTemplatesProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" className="w-full" onClick={() => setOpen(!open)}>
        Templates
      </Button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)] rounded-lg p-1 z-50 animate-fade-in-up shadow-xl max-h-[60vh] overflow-auto">
          {templates.map((group) => (
            <div key={group.category}>
              <div className="px-3 py-1.5 text-[10px] font-medium text-[#464a4d] uppercase tracking-wider">
                {group.category}
              </div>
              {group.items.map((t) => (
                <button
                  key={t.name}
                  onClick={() => { onSelect(t.title, t.content); setOpen(false) }}
                  className="w-full text-left px-3 py-2 rounded-md text-xs text-[#a1a4a5] hover:bg-[#101012] hover:text-[#fcfdff] transition-colors"
                >
                  {t.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
