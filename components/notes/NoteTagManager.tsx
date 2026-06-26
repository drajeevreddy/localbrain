'use client'

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'

interface Tag {
  id: string
  name: string
  color: string
}

interface NoteTagManagerProps {
  noteId: string
  onTagsChange?: (tags: Tag[]) => void
}

const COLORS = ['#3b9eff', '#11ff99', '#ffc53d', '#ff801f', '#ff2047', '#a855f7', '#06b6d4', '#f97316']

export default function NoteTagManager({ noteId, onTagsChange }: NoteTagManagerProps) {
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [noteTags, setNoteTags] = useState<Tag[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(COLORS[0])

  const fetchTags = useCallback(async () => {
    const res = await fetch('/api/tags')
    if (res.ok) {
      const data = await res.json()
      setAllTags(data.tags)
    }
  }, [])

  const fetchNoteTags = useCallback(async () => {
    const res = await fetch(`/api/tags/note?noteId=${noteId}`)
    if (res.ok) {
      const data = await res.json()
      setNoteTags(data.tags)
      onTagsChange?.(data.tags)
    }
  }, [noteId, onTagsChange])

  useEffect(() => { fetchTags() }, [fetchTags])
  useEffect(() => { if (noteId) fetchNoteTags() }, [noteId, fetchNoteTags])

  const addTag = async (tagId: string) => {
    const res = await fetch('/api/tags/note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteId, tagId }),
    })
    if (res.ok) {
      fetchNoteTags()
      toast.success('Tag added')
    }
    setShowDropdown(false)
  }

  const removeTag = async (tagId: string) => {
    const res = await fetch('/api/tags/note', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteId, tagId }),
    })
    if (res.ok) fetchNoteTags()
  }

  const createAndAddTag = async () => {
    if (!newTagName.trim()) return
    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTagName, color: newTagColor }),
    })
    if (res.ok) {
      const data = await res.json()
      setAllTags([...allTags, data.tag])
      await addTag(data.tag.id)
      setNewTagName('')
      toast.success('Tag created')
    }
  }

  const availableTags = allTags.filter((t) => !noteTags.some((nt) => nt.id === t.id))

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {noteTags.map((tag) => (
        <span
          key={tag.id}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
          style={{ background: `${tag.color}20`, color: tag.color }}
        >
          {tag.name}
          <button onClick={() => removeTag(tag.id)} className="hover:opacity-70">×</button>
        </span>
      ))}

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs text-[#464a4d] hover:text-[#a1a4a5] border border-dashed border-[rgba(255,255,255,0.14)] hover:border-[rgba(255,255,255,0.24)] transition-colors"
        >
          + Tag
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 mt-1 w-56 bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)] rounded-lg p-2 z-50 animate-fade-in-up shadow-xl">
            <div className="flex gap-1 mb-2">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createAndAddTag()}
                placeholder="New tag..."
                className="flex-1 bg-[#06060a] text-[#fcfdff] border border-[rgba(255,255,255,0.14)] rounded px-2 py-1 text-xs focus:outline-none focus:border-[#3b9eff]"
              />
              <div className="flex gap-0.5">
                {COLORS.slice(0, 4).map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewTagColor(c)}
                    className={`w-4 h-4 rounded-full ${newTagColor === c ? 'ring-2 ring-white' : ''}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
            {newTagName.trim() && (
              <button
                onClick={createAndAddTag}
                className="w-full text-left px-2 py-1.5 rounded text-xs text-[#3b9eff] hover:bg-[#101012] transition-colors"
              >
                Create &quot;{newTagName}&quot;
              </button>
            )}
            {availableTags.length > 0 && (
              <div className="border-t border-[rgba(255,255,255,0.06)] mt-1 pt-1 max-h-32 overflow-auto">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => addTag(tag.id)}
                    className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-[#101012] transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: tag.color }} />
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
