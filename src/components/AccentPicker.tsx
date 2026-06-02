import { useState, useRef, useEffect } from 'react'
import { Check } from 'lucide-react'

interface AccentPickerProps {
  accentColor: string | null
  onChangeAccentColor: (color: string | null) => void
}

const PRESETS = [
  '#6366f1', '#3b82f6', '#0ea5e9', '#14b8a6',
  '#10b981', '#84cc16', '#f59e0b', '#f97316',
  '#ef4444', '#f43f5e', '#ec4899', '#8b5cf6',
]

export default function AccentPicker({ accentColor, onChangeAccentColor }: AccentPickerProps) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (panelRef.current?.contains(e.target as Node)) return
      if (btnRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        className="toolbar-btn"
        onClick={() => setOpen(!open)}
        title="Accent color"
      >
        <span
          style={{
            display: 'inline-block',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: accentColor || 'var(--accent)',
            border: '1px solid var(--border)',
            flexShrink: 0,
          }}
        />
        <span className="toolbar-btn-label">Accent</span>
      </button>

      {open && (
        <div ref={panelRef} className="font-panel" style={{ minWidth: 190, right: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text2)', marginBottom: 8 }}>
            Accent Color
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: 10 }}>
            {PRESETS.map(c => (
              <button
                key={c}
                onClick={() => onChangeAccentColor(c === accentColor ? null : c)}
                title={c}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: c === (accentColor || '#6366f1') ? '2px solid var(--text)' : '1px solid var(--border)',
                  background: c,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                {c === (accentColor || '#6366f1') && (
                  <Check size={12} color={parseInt(c.slice(1), 16) > 0x888888 ? '#fff' : '#000'} />
                )}
              </button>
            ))}
          </div>

          <label className="font-label">
            Custom
            <input
              type="color"
              value={accentColor || '#6366f1'}
              onChange={e => onChangeAccentColor(e.target.value)}
              style={{
                width: '100%',
                height: 32,
                padding: 2,
                border: '1px solid var(--border)',
                borderRadius: 6,
                background: 'var(--surface)',
                cursor: 'pointer',
              }}
            />
          </label>

          {accentColor && (
            <button
              className="toolbar-btn"
              style={{ marginTop: 8, width: '100%', justifyContent: 'center', fontSize: 12 }}
              onClick={() => onChangeAccentColor(null)}
            >
              Reset to default
            </button>
          )}
        </div>
      )}
    </div>
  )
}
