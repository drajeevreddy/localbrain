'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

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

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(title, content)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Note"
          className="bg-transparent text-[#fcfdff] text-xl font-medium focus:outline-none placeholder:text-[#464a4d] flex-1"
        />
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
          {onDelete && (
            <Button variant="danger" size="sm" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {showPreview ? (
          <div className="prose prose-invert max-w-none text-[rgba(252,253,255,0.86)] whitespace-pre-wrap">
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
