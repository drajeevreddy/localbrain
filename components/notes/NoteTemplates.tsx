'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

interface NoteTemplatesProps {
  onSelect: (title: string, content: string) => void
}

const templates = [
  {
    name: 'Lecture Notes',
    title: 'Lecture: [Topic]',
    content: `# Lecture Notes\n\n## Date: ${new Date().toLocaleDateString()}\n\n## Key Concepts\n\n\n\n## Details\n\n\n\n## Questions\n\n\n\n## Summary\n\n`,
  },
  {
    name: 'Study Guide',
    title: 'Study Guide: [Topic]',
    content: `# Study Guide\n\n## Overview\n\n\n\n## Key Terms\n\n| Term | Definition |\n|------|------------|\n|      |            |\n\n## Formulas / Rules\n\n\n\n## Practice Questions\n\n1. \n2. \n3. \n\n## Notes\n\n`,
  },
  {
    name: 'Research Notes',
    title: 'Research: [Topic]',
    content: `# Research Notes\n\n## Research Question\n\n\n\n## Sources\n\n1. \n2. \n3. \n\n## Key Findings\n\n\n\n## Analysis\n\n\n\n## Conclusions\n\n\n\n## References\n\n`,
  },
  {
    name: 'Book Notes',
    title: 'Book: [Title]',
    content: `# Book Notes\n\n**Author:** \n**Rating:** /5\n\n## Summary\n\n\n\n## Key Takeaways\n\n1. \n2. \n3. \n\n## Favorite Quotes\n\n> \n\n## How I'll Apply This\n\n\n`,
  },
  {
    name: 'Meeting Notes',
    title: 'Meeting: [Topic]',
    content: `# Meeting Notes\n\n**Date:** ${new Date().toLocaleDateString()}\n**Attendees:** \n\n## Agenda\n\n1. \n2. \n\n## Discussion\n\n\n\n## Action Items\n\n- [ ] \n- [ ] \n\n## Next Steps\n\n`,
  },
  {
    name: 'Blank',
    title: 'Untitled',
    content: '',
  },
]

export default function NoteTemplates({ onSelect }: NoteTemplatesProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" className="w-full" onClick={() => setOpen(!open)}>
        Templates
      </Button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)] rounded-lg p-1 z-50 animate-fade-in-up shadow-xl">
          {templates.map((t) => (
            <button
              key={t.name}
              onClick={() => { onSelect(t.title, t.content); setOpen(false) }}
              className="w-full text-left px-3 py-2 rounded-md text-xs text-[#a1a4a5] hover:bg-[#101012] hover:text-[#fcfdff] transition-colors"
            >
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
