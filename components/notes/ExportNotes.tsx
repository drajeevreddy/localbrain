'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface ExportNotesProps {
  notes: Array<{ id: string; title: string; content: string }>
  selectedNote?: { id: string; title: string; content: string } | null
}

export default function ExportNotes({ notes, selectedNote }: ExportNotesProps) {
  const [open, setOpen] = useState(false)

  const exportMarkdown = () => {
    const target = selectedNote ? [selectedNote] : notes
    if (target.length === 0) { toast.error('No notes to export'); return }

    const md = target.map((n) => `# ${n.title}\n\n${n.content}`).join('\n\n---\n\n')
    const blob = new Blob([md], { type: 'text/markdown' })
    downloadBlob(blob, 'notes.md')
    toast.success('Exported as Markdown')
    setOpen(false)
  }

  const exportText = () => {
    const target = selectedNote ? [selectedNote] : notes
    if (target.length === 0) { toast.error('No notes to export'); return }

    const text = target.map((n) => `${'='.repeat(50)}\n${n.title}\n${'='.repeat(50)}\n\n${n.content}`).join('\n\n')
    const blob = new Blob([text], { type: 'text/plain' })
    downloadBlob(blob, 'notes.txt')
    toast.success('Exported as text')
    setOpen(false)
  }

  const exportJSON = () => {
    const target = selectedNote ? [selectedNote] : notes
    if (target.length === 0) { toast.error('No notes to export'); return }

    const json = JSON.stringify(target.map((n) => ({ title: n.title, content: n.content, exportedAt: new Date().toISOString() })), null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    downloadBlob(blob, 'notes.json')
    toast.success('Exported as JSON')
    setOpen(false)
  }

  const exportHTML = () => {
    const target = selectedNote ? [selectedNote] : notes
    if (target.length === 0) { toast.error('No notes to export'); return }

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>LocalBrain Export</title>
<style>body{font-family:system-ui;max-width:800px;margin:0 auto;padding:40px;background:#000;color:#fcfdff}
h1{border-bottom:1px solid rgba(255,255,255,0.14);padding-bottom:16px}
.note{margin-bottom:40px;padding:24px;background:#0a0a0c;border-radius:12px;border:1px solid rgba(255,255,255,0.14)}
pre{white-space:pre-wrap;font-size:14px;line-height:1.6}</style></head>
<body><h1>LocalBrain Notes Export</h1>
${target.map((n) => `<div class="note"><h2>${escapeHtml(n.title)}</h2><pre>${escapeHtml(n.content)}</pre></div>`).join('\n')}
</body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    downloadBlob(blob, 'notes.html')
    toast.success('Exported as HTML')
    setOpen(false)
  }

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>
        Export
      </Button>

      {open && (
        <div className="absolute bottom-full right-0 mb-1 bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)] rounded-lg p-1 z-50 animate-fade-in-up shadow-xl min-w-[140px]">
          <button onClick={exportMarkdown} className="w-full text-left px-3 py-2 rounded-md text-xs text-[#a1a4a5] hover:bg-[#101012] hover:text-[#fcfdff] transition-colors">
            Markdown (.md)
          </button>
          <button onClick={exportText} className="w-full text-left px-3 py-2 rounded-md text-xs text-[#a1a4a5] hover:bg-[#101012] hover:text-[#fcfdff] transition-colors">
            Plain Text (.txt)
          </button>
          <button onClick={exportHTML} className="w-full text-left px-3 py-2 rounded-md text-xs text-[#a1a4a5] hover:bg-[#101012] hover:text-[#fcfdff] transition-colors">
            HTML (.html)
          </button>
          <button onClick={exportJSON} className="w-full text-left px-3 py-2 rounded-md text-xs text-[#a1a4a5] hover:bg-[#101012] hover:text-[#fcfdff] transition-colors">
            JSON (.json)
          </button>
        </div>
      )}
    </div>
  )
}
