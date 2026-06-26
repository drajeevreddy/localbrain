'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'

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
  const [view, setView] = useState<'notes' | 'chat' | 'graph'>('notes')
  const [settings, setSettings] = useState<{ provider: string; apiKey: string }>({ provider: 'nvidia', apiKey: '' })
  const [mounted, setMounted] = useState(false)
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

    const { data } = await supabase
      .from('notes')
      .insert({ user_id: user.id, title: 'Untitled', content: '' })
      .select()
      .single()

    if (data) {
      setNotes([data, ...notes])
      setSelectedNote(data)
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
    }
  }

  const handleDeleteNote = async () => {
    if (!selectedNote) return
    const supabase = getSupabase()
    if (!supabase) return

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', selectedNote.id)

    if (!error) {
      setNotes(notes.filter((n) => n.id !== selectedNote.id))
      setSelectedNote(null)
    }
  }

  const handleIngest = async () => {
    if (!selectedNote || settings.apiKey === '') return

    const res = await fetch('/api/notes/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: selectedNote.title,
        content: selectedNote.content,
        provider: settings.provider,
        apiKey: 'placeholder',
      }),
    })

    if (res.ok) {
      alert('Note ingested into knowledge graph!')
    }
  }

  const handleLogout = async () => {
    const supabase = getSupabase()
    if (supabase) await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-[#000000] text-[#fcfdff]">
      <div className="w-64 border-r border-[rgba(255,255,255,0.06)] flex flex-col">
        <div className="p-4 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold">LocalMind</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0a0c] text-[#fcfdff] border border-[rgba(255,255,255,0.14)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#fcfdff] placeholder:text-[#464a4d]"
          />
        </div>

        <div className="p-2">
          <Button variant="primary" size="sm" className="w-full" onClick={handleNewNote}>
            + New Note
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-2 space-y-1">
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => {
                setSelectedNote(note)
                setView('notes')
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedNote?.id === note.id
                  ? 'bg-[#101012] text-[#fcfdff]'
                  : 'text-[#a1a4a5] hover:bg-[#0a0a0c] hover:text-[#fcfdff]'
              }`}
            >
              <div className="font-medium truncate">{note.title || 'Untitled'}</div>
              <div className="text-xs text-[#464a4d] truncate mt-0.5">
                {note.content.slice(0, 60) || 'Empty note'}
              </div>
            </button>
          ))}
        </div>

        <div className="p-2 border-t border-[rgba(255,255,255,0.06)] space-y-1">
          <Link
            href="/app/graph"
            className="block px-3 py-2 rounded-lg text-sm text-[#a1a4a5] hover:bg-[#0a0a0c] hover:text-[#fcfdff] transition-colors"
          >
            Knowledge Graph
          </Link>
          <Link
            href="/app/chat"
            className="block px-3 py-2 rounded-lg text-sm text-[#a1a4a5] hover:bg-[#0a0a0c] hover:text-[#fcfdff] transition-colors"
          >
            Chat
          </Link>
          <Link
            href="/app/settings"
            className="block px-3 py-2 rounded-lg text-sm text-[#a1a4a5] hover:bg-[#0a0a0c] hover:text-[#fcfdff] transition-colors"
          >
            Settings
          </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {view === 'notes' && selectedNote && (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 px-6 py-3 border-b border-[rgba(255,255,255,0.06)]">
              <Button variant="ghost" size="sm" onClick={handleIngest}>
                Ingest to Graph
              </Button>
            </div>
            <div className="flex-1">
              <iframe
                src={`/app/note/${selectedNote.id}`}
                className="w-full h-full border-0"
                title="Note editor"
              />
            </div>
          </div>
        )}

        {view === 'notes' && !selectedNote && (
          <div className="flex-1 flex items-center justify-center text-[#464a4d]">
            Select a note or create a new one
          </div>
        )}

        {children}
      </div>
    </div>
  )
}
