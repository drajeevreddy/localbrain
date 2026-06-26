'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import NoteEditor from '@/components/notes/NoteEditor'
import NoteTemplates from '@/components/notes/NoteTemplates'
import SmartSearch from '@/components/notes/SmartSearch'
import ExportNotes from '@/components/notes/ExportNotes'
import NoteTagManager from '@/components/notes/NoteTagManager'
import StudyTools from '@/components/study/StudyTools'
import CorporateTools from '@/components/corporate/CorporateTools'
import PomodoroTimer from '@/components/study/PomodoroTimer'
import ToastProvider from '@/components/ui/ToastProvider'
import { useKeyboardShortcuts } from '@/components/ui/KeyboardShortcuts'
import toast from 'react-hot-toast'

interface Note {
  id: string
  title: string
  content: string
  created_at: string
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [settings, setSettings] = useState<{ provider: string; apiKey: string }>({ provider: 'nvidia', apiKey: '' })
  const [mounted, setMounted] = useState(false)
  const [ingesting, setIngesting] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const supabaseRef = useRef<Awaited<ReturnType<typeof import('@/lib/supabase/client').createClient>> | null>(null)

  useEffect(() => {
    setMounted(true)
    import('@/lib/supabase/client').then(({ createClient }) => {
      supabaseRef.current = createClient()
    }).catch(() => {})
  }, [])

  const getSupabase = useCallback(() => supabaseRef.current, [])

  const fetchNotes = useCallback(async () => {
    const supabase = getSupabase()
    if (!supabase) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (data) setNotes(data)
  }, [getSupabase])

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        const activeConfig = data.provider_configs?.find(
          (c: { name: string; enabled: boolean; hasKey: boolean }) => c.enabled && c.hasKey
        )
        if (activeConfig) {
          setSettings({ provider: activeConfig.name, apiKey: 'exists' })
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (!mounted) return
    fetchNotes()
    fetchSettings()
  }, [mounted, fetchNotes, fetchSettings])

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleNewNote = async () => {
    const supabase = getSupabase()
    if (!supabase) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('notes')
      .insert({ user_id: user.id, title: 'Untitled', content: '' })
      .select()
      .single()

    if (error) {
      toast.error('Failed to create note')
      return
    }

    if (data) {
      setNotes([data, ...notes])
      setSelectedNote(data)
      setSidebarOpen(false)
      toast.success('Note created')
    }
  }

  const handleSaveNote = async (title: string, content: string) => {
    if (!selectedNote) return
    const supabase = getSupabase()
    if (!supabase) return

    const { error } = await supabase
      .from('notes')
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq('id', selectedNote.id)

    if (!error) {
      setNotes(notes.map((n) => (n.id === selectedNote.id ? { ...n, title, content } : n)))
      setSelectedNote({ ...selectedNote, title, content })
      toast.success('Note saved')
    } else {
      toast.error('Failed to save')
    }
  }

  const handleDeleteNote = async (noteId?: string) => {
    const targetId = noteId || selectedNote?.id
    if (!targetId) return
    const supabase = getSupabase()
    if (!supabase) return

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', targetId)

    if (!error) {
      setNotes(notes.filter((n) => n.id !== targetId))
      if (selectedNote?.id === targetId) setSelectedNote(null)
      toast.success('Note deleted')
    } else {
      toast.error('Failed to delete')
    }
  }

  const handleIngest = async (noteId?: string) => {
    const targetNote = noteId ? notes.find((n) => n.id === noteId) : selectedNote
    if (!targetNote) {
      toast.error('No note selected')
      return
    }

    setIngesting(true)
    try {
      const res = await fetch('/api/notes/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteId: targetNote.id,
          title: targetNote.title,
          content: targetNote.content,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(`Ingested: ${data.chunksCreated} chunks, ${data.entitiesExtracted} entities`)
      } else {
        const err = await res.json()
        toast.error(err.error || 'Ingestion failed')
      }
    } catch {
      toast.error('Ingestion failed')
    } finally {
      setIngesting(false)
    }
  }

  const handleBatchIngest = async () => {
    const notesToIngest = notes.filter((n) => n.content.trim().length > 0)
    if (notesToIngest.length === 0) {
      toast.error('No notes with content to ingest')
      return
    }

    setIngesting(true)
    let successCount = 0

    for (const note of notesToIngest) {
      try {
        const res = await fetch('/api/notes/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            noteId: note.id,
            title: note.title,
            content: note.content,
          }),
        })
        if (res.ok) successCount++
      } catch {}
    }

    setIngesting(false)
    toast.success(`Ingested ${successCount}/${notesToIngest.length} notes`)
  }

  const handleLogout = async () => {
    const supabase = getSupabase()
    if (supabase) await supabase.auth.signOut()
    router.push('/login')
  }

  useKeyboardShortcuts({
    onSave: selectedNote ? () => handleSaveNote(selectedNote.title, selectedNote.content) : undefined,
    onNewNote: handleNewNote,
    onDelete: selectedNote ? () => handleDeleteNote() : undefined,
  })

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-3 md:p-4 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-sm md:text-base">LocalBrain</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0a0a0c] text-[#fcfdff] border border-[rgba(255,255,255,0.14)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b9eff] focus:shadow-[0_0_12px_rgba(59,158,255,0.15)] placeholder:text-[#464a4d] transition-all duration-200"
        />
        <SmartSearch onNavigate={(id) => { const note = notes.find((n) => n.id === id); if (note) { setSelectedNote(note); setSidebarOpen(false) } }} />
      </div>

      <div className="p-2 space-y-1">
        <Button variant="primary" size="sm" className="w-full" onClick={handleNewNote}>
          + New Note
        </Button>
        <NoteTemplates onSelect={async (title, content) => {
          const supabase = getSupabase()
          if (!supabase) return
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return
          const { data } = await supabase.from('notes').insert({ user_id: user.id, title, content }).select().single()
          if (data) { setNotes([data, ...notes]); setSelectedNote(data); setSidebarOpen(false) }
        }} />
        {notes.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={handleBatchIngest}
            disabled={ingesting}
          >
            {ingesting ? 'Ingesting...' : `Batch Ingest (${notes.length})`}
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-2 space-y-1">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className={`group relative flex items-center rounded-lg transition-all duration-200 ${
              selectedNote?.id === note.id
                ? 'bg-[#101012] text-[#fcfdff]'
                : 'text-[#a1a4a5] hover:bg-[#0a0a0c] hover:text-[#fcfdff]'
            }`}
          >
            <button
              onClick={() => { setSelectedNote(note); setSidebarOpen(false) }}
              className="flex-1 text-left px-3 py-2 text-sm"
            >
              <div className="font-medium truncate">{note.title || 'Untitled'}</div>
              <div className="text-xs text-[#464a4d] truncate mt-0.5">
                {note.content.slice(0, 60) || 'Empty note'}
              </div>
            </button>
            <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5 pr-1">
              <button
                onClick={(e) => { e.stopPropagation(); handleIngest(note.id) }}
                className="p-1 rounded hover:bg-[rgba(59,158,255,0.1)] text-[#3b9eff] transition-colors"
                title="Ingest"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id) }}
                className="p-1 rounded hover:bg-[rgba(255,32,71,0.1)] text-[#ff2047] transition-colors"
                title="Delete"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-[rgba(255,255,255,0.06)] space-y-1">
        <Link href="/app/graph" onClick={() => setSidebarOpen(false)}
          className="block px-3 py-2 rounded-lg text-sm text-[#a1a4a5] hover:bg-[#0a0a0c] hover:text-[#fcfdff] transition-colors">
          Knowledge Graph
        </Link>
        <Link href="/app/chat" onClick={() => setSidebarOpen(false)}
          className="block px-3 py-2 rounded-lg text-sm text-[#a1a4a5] hover:bg-[#0a0a0c] hover:text-[#fcfdff] transition-colors">
          Chat
        </Link>
        <Link href="/app/settings" onClick={() => setSidebarOpen(false)}
          className="block px-3 py-2 rounded-lg text-sm text-[#a1a4a5] hover:bg-[#0a0a0c] hover:text-[#fcfdff] transition-colors">
          Settings
        </Link>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[#000000] text-[#fcfdff]">
      <ToastProvider />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile, toggle with hamburger */}
      <div className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#000000] border-r border-[rgba(255,255,255,0.06)] transform transition-transform duration-200 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[rgba(255,255,255,0.06)] md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-[#101012] transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-sm">LocalBrain</span>
        </div>

        {selectedNote && (
          <div className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 border-b border-[rgba(255,255,255,0.06)] flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => handleIngest()} disabled={ingesting}>
              {ingesting ? 'Ingesting...' : 'Ingest to Graph'}
            </Button>
            <div className="flex-1" />
            <NoteTagManager noteId={selectedNote.id} />
            <ExportNotes notes={notes} selectedNote={selectedNote} />
          </div>
        )}

        <div className="flex-1 overflow-auto">
          {selectedNote ? (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-auto">
                <NoteEditor note={selectedNote} onSave={handleSaveNote} onDelete={() => handleDeleteNote()} />
              </div>
              {selectedNote.content.trim().length > 50 && (
                <div className="flex flex-col">
                  <StudyTools content={selectedNote.content} />
                  <CorporateTools content={selectedNote.content} />
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center h-full text-[#464a4d] text-sm">
              Select a note or create a new one
            </div>
          )}
        </div>

        {!selectedNote && children}
      </div>

      {/* Floating Pomodoro timer - hidden on mobile */}
      <div className="fixed bottom-4 right-4 z-30 hidden md:block">
        <div className="bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)] rounded-xl p-3 shadow-xl">
          <PomodoroTimer />
        </div>
      </div>
    </div>
  )
}
