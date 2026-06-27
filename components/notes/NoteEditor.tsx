'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import PdfUploader from './PdfUploader'

interface NoteEditorProps {
  note: { id: string; title: string; content: string } | null
  onSave: (title: string, content: string) => Promise<void>
  onDelete?: () => Promise<void>
}

export default function NoteEditor({ note, onSave, onDelete }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showPdfUpload, setShowPdfUpload] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(title, content)
    } finally {
      setSaving(false)
    }
  }

  const handlePdfUpload = (pdfContent: string, filename: string) => {
    const separator = content ? '\n\n---\n\n' : ''
    setContent(content + separator + `## ${filename}\n\n${pdfContent}`)
    setShowPdfUpload(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 md:px-6 py-2.5 md:py-4 border-b border-[rgba(255,255,255,0.06)]">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Note"
          className="bg-transparent text-[#fcfdff] text-base md:text-xl font-medium focus:outline-none placeholder:text-[#464a4d] flex-1 min-w-0"
        />
        <div className="flex items-center gap-1 md:gap-2 ml-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => setShowPdfUpload(!showPdfUpload)}>
            PDF
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? '...' : 'Save'}
          </Button>
          {onDelete && (
            <Button variant="danger" size="sm" onClick={onDelete} className="hidden md:inline-flex">
              Delete
            </Button>
          )}
        </div>
      </div>

      {showPdfUpload && (
        <div className="px-3 md:px-6 py-3 md:py-4 border-b border-[rgba(255,255,255,0.06)]">
          <PdfUploader onUpload={handlePdfUpload} />
        </div>
      )}

      <div className="flex-1 overflow-auto p-3 md:p-6 min-h-0">
        {showPreview ? (
          <div className="prose prose-invert max-w-none text-[rgba(252,253,255,0.86)] whitespace-pre-wrap text-sm">
            {content || 'Nothing to preview'}
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing... (Markdown supported)"
            className="w-full h-full bg-transparent text-[rgba(252,253,255,0.86)] text-sm leading-relaxed focus:outline-none placeholder:text-[#464a4d] resize-none font-mono"
          />
        )}
      </div>
    </div>
  )
}
