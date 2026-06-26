'use client'

import { useState, useEffect, useCallback } from 'react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface NoteVersion {
  id: string
  title: string
  content: string
  created_at: string
}

interface NoteVersionHistoryProps {
  noteId: string
  onRestore: (title: string, content: string) => void
}

export default function NoteVersionHistory({ noteId, onRestore }: NoteVersionHistoryProps) {
  const [versions, setVersions] = useState<NoteVersion[]>([])
  const [show, setShow] = useState(false)
  const [selected, setSelected] = useState<NoteVersion | null>(null)

  const fetchVersions = useCallback(async () => {
    const res = await fetch(`/api/notes/versions?noteId=${noteId}`)
    if (res.ok) {
      const data = await res.json()
      setVersions(data.versions)
    }
  }, [noteId])

  useEffect(() => {
    if (show) fetchVersions()
  }, [show, fetchVersions])

  const restore = (version: NoteVersion) => {
    onRestore(version.title, version.content)
    setShow(false)
    toast.success('Version restored')
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setShow(true)}>
        History
      </Button>

      {show && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShow(false)}>
          <div className="bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)] rounded-xl w-full max-w-lg max-h-[70vh] flex flex-col animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
              <h3 className="font-medium text-sm">Version History</h3>
              <button onClick={() => setShow(false)} className="text-[#464a4d] hover:text-[#fcfdff]">×</button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-2">
              {versions.length === 0 && (
                <div className="text-center text-xs text-[#464a4d] py-8">No versions yet</div>
              )}
              {versions.map((v) => (
                <div
                  key={v.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selected?.id === v.id
                      ? 'border-[#3b9eff] bg-[rgba(59,158,255,0.05)]'
                      : 'border-[rgba(255,255,255,0.14)] hover:border-[rgba(255,255,255,0.24)]'
                  }`}
                  onClick={() => setSelected(selected?.id === v.id ? null : v)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#a1a4a5]">{new Date(v.created_at).toLocaleString()}</span>
                    {selected?.id === v.id && (
                      <Button size="sm" onClick={() => restore(v)}>Restore</Button>
                    )}
                  </div>
                  {selected?.id === v.id && (
                    <div className="mt-2 text-xs text-[#464a4d] max-h-32 overflow-auto whitespace-pre-wrap">
                      {v.content.slice(0, 500)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
