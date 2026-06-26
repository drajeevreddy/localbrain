'use client'

import { useEffect } from 'react'

interface ShortcutConfig {
  onSave?: () => void
  onNewNote?: () => void
  onSearch?: () => void
  onDelete?: () => void
}

export function useKeyboardShortcuts({ onSave, onNewNote, onSearch, onDelete }: ShortcutConfig) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey

      if (isMod && e.key === 's') {
        e.preventDefault()
        onSave?.()
      }
      if (isMod && e.key === 'n') {
        e.preventDefault()
        onNewNote?.()
      }
      if (isMod && e.key === 'k') {
        e.preventDefault()
        onSearch?.()
      }
      if (isMod && e.key === 'Backspace') {
        e.preventDefault()
        onDelete?.()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onSave, onNewNote, onSearch, onDelete])
}

export default function ShortcutHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  const shortcuts = [
    { keys: 'Ctrl+S', desc: 'Save note' },
    { keys: 'Ctrl+N', desc: 'New note' },
    { keys: 'Ctrl+K', desc: 'Smart search' },
    { keys: 'Ctrl+Del', desc: 'Delete note' },
  ]

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0a0a0c] border border-[rgba(255,255,255,0.14)] rounded-xl p-6 w-full max-w-sm animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-medium text-[#fcfdff] mb-4">Keyboard Shortcuts</h3>
        <div className="space-y-2">
          {shortcuts.map((s) => (
            <div key={s.keys} className="flex items-center justify-between">
              <span className="text-sm text-[#a1a4a5]">{s.desc}</span>
              <kbd className="px-2 py-0.5 rounded bg-[#101012] border border-[rgba(255,255,255,0.14)] text-xs text-[#fcfdff] font-mono">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 w-full text-center text-xs text-[#464a4d] hover:text-[#a1a4a5] transition-colors">
          Close
        </button>
      </div>
    </div>
  )
}
