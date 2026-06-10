import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Type } from 'lucide-react'
import { ENGLISH_FONTS, KHMER_FONTS } from '../fonts'

const PANEL_WIDTH = 210
const PAD = 8

interface FontSettingsProps {
  englishFont: string
  khmerFont: string
  onChangeEnglish: (font: string) => void
  onChangeKhmer: (font: string) => void
  compact?: boolean
}

export default function FontSettings({
  englishFont,
  khmerFont,
  onChangeEnglish,
  onChangeKhmer,
  compact,
}: FontSettingsProps) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  const updatePos = useCallback(() => {
    const btn = btnRef.current
    if (!btn) return
    const r = btn.getBoundingClientRect()
    const cw = document.documentElement.clientWidth
    const ch = document.documentElement.clientHeight
    const pw = PANEL_WIDTH
    const ph = 200
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

    function handleClick(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, updatePos])

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        className={compact ? 'review-sidebar-btn' : 'toolbar-btn'}
        onClick={() => setOpen(o => !o)}
        title="Font settings"
      >
        <Type size={compact ? 18 : 15} />
        {!compact && <span className="toolbar-btn-label">Font</span>}
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          className="font-panel"
          style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 1000 }}
        >
          <label className="font-label">
            <span>English</span>
            <select
              className="font-select"
              value={englishFont}
              onChange={e => onChangeEnglish(e.target.value)}
            >
              {ENGLISH_FONTS.map(f => (
                <option key={f.name} value={f.name}>{f.name}</option>
              ))}
            </select>
          </label>
          <label className="font-label">
            <span>Khmer</span>
            <select
              className="font-select"
              value={khmerFont}
              onChange={e => onChangeKhmer(e.target.value)}
            >
              {KHMER_FONTS.map(f => (
                <option key={f.name} value={f.name}>{f.name}</option>
              ))}
            </select>
          </label>
        </div>,
        document.body
      )}
    </div>
  )
}
