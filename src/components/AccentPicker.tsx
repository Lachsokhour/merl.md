import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Check } from 'lucide-react'

const PANEL_WIDTH = 190
const PAD = 8

interface AccentPickerProps {
  accentColor: string | null
  onChangeAccentColor: (color: string | null) => void
  theme: 'light' | 'dark'
  compact?: boolean
}

const PRESETS = [
  '#6366f1', '#3b82f6', '#0ea5e9', '#14b8a6',
  '#10b981', '#84cc16', '#f59e0b', '#f97316',
  '#ef4444', '#f43f5e', '#ec4899', '#8b5cf6',
]

const DEFAULT_ACCENT = '#6366f1'
const DARK_DEFAULT = '#818cf8'

export default function AccentPicker({ accentColor, onChangeAccentColor, theme, compact }: AccentPickerProps) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const defaultAccent = theme === 'dark' ? DARK_DEFAULT : DEFAULT_ACCENT

  const updatePos = useCallback(() => {
    const btn = btnRef.current
    if (!btn) return
    const r = btn.getBoundingClientRect()
    const cw = document.documentElement.clientWidth
    const ch = document.documentElement.clientHeight
    const pw = PANEL_WIDTH
    const ph = 248
    const center = r.left + r.width / 2
    let left: number
    if (center > cw / 2) {
      left = r.right - pw
    } else {
      left = r.left
    }
    left = Math.max(PAD, Math.min(left, cw - pw - PAD))
    const below = r.bottom + 6
    const above = r.top - ph - 6
    const top = below + ph > ch && above > 0 ? above : below
    setPos({ top, left })
  }, [])

  useEffect(() => {
    if (!open) return
    updatePos()

    function onDown(e: MouseEvent) {
      if (panelRef.current?.contains(e.target as Node)) return
      if (btnRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open, updatePos])

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        className={compact ? 'review-sidebar-btn' : 'toolbar-btn'}
        onClick={() => setOpen(!open)}
        title="Accent color"
      >
        <span
          style={{
            display: 'inline-block',
            width: compact ? 16 : 12,
            height: compact ? 16 : 12,
            borderRadius: '50%',
            background: accentColor || 'var(--accent)',
            border: compact ? '2px solid var(--border)' : '1px solid var(--border)',
            flexShrink: 0,
          }}
        />
        {!compact && <span className="toolbar-btn-label">Accent</span>}
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          className="font-panel"
          style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 1000, minWidth: PANEL_WIDTH }}
        >
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
                  border: c === (accentColor || defaultAccent) ? '2px solid var(--text)' : '1px solid var(--border)',
                  background: c,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                {c === (accentColor || defaultAccent) && (
                  <Check size={12} color={parseInt(c.slice(1), 16) > 0x888888 ? '#fff' : '#000'} />
                )}
              </button>
            ))}
          </div>

          <label className="font-label">
            Custom
            <input
              type="color"
              value={accentColor || defaultAccent}
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
        </div>,
        document.body
      )}
    </div>
  )
}
