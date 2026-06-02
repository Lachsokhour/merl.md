import { useState, useRef, useEffect } from 'react'
import { Type } from 'lucide-react'
import { ENGLISH_FONTS, KHMER_FONTS } from '../fonts'

interface FontSettingsProps {
  englishFont: string
  khmerFont: string
  onChangeEnglish: (font: string) => void
  onChangeKhmer: (font: string) => void
}

export default function FontSettings({
  englishFont,
  khmerFont,
  onChangeEnglish,
  onChangeKhmer,
}: FontSettingsProps) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
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
  }, [open])

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        className="toolbar-btn"
        onClick={() => setOpen(o => !o)}
        title="Font settings"
      >
        <Type size={15} />
        <span className="toolbar-btn-label">Font</span>
      </button>

      {open && (
        <div ref={panelRef} className="font-panel">
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
        </div>
      )}
    </div>
  )
}
