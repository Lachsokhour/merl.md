import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Info } from 'lucide-react'
import { APP_VERSION } from '../version'

const PANEL_WIDTH = 260
const PAD = 8

export default function AboutOverlay() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!open) return
    const btn = btnRef.current
    if (!btn) return
    const r = btn.getBoundingClientRect()
    const cw = document.documentElement.clientWidth
    const pw = PANEL_WIDTH
    const center = r.left + r.width / 2
    let left: number
    if (center > cw / 2) {
      left = r.right - pw
    } else {
      left = r.left
    }
    left = Math.max(PAD, Math.min(left, cw - pw - PAD))
    setPos({ top: r.bottom + 6, left })

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
        title="About merl.md"
      >
        <Info size={15} />
        <span className="toolbar-btn-label">About</span>
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          className="font-panel"
          style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 1000, minWidth: PANEL_WIDTH, maxWidth: 300, padding: 0, gap: 0, overflow: 'hidden' }}
        >
          <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.3px', marginBottom: 2 }}>
              <span style={{ color: 'var(--text)' }}>មើល .md</span>
              <span style={{ color: 'var(--accent)', margin: '0 4px' }}>◇</span>
              <span style={{ color: 'var(--text)' }}>merl.md</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
              A lightweight bilingual markdown previewer with live rendering and a clean, responsive UI.
            </div>
          </div>

          <div style={{ padding: '14px 20px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text2)' }}>
              Features
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['Live Preview', 'Split-pane editor with draggable divider'],
                ['Full GFM', 'Tables, task lists, alerts, and more'],
                ['Collapsible Sections', 'Click headings to collapse/expand'],
                ['GFM Alerts', 'Note, Tip, Warning, Caution, Important'],
                ['Syntax Highlight', 'Atom-one-dark theme for 13+ languages'],
                ['Mermaid Diagrams', 'Flowcharts, sequence, Gantt, and more'],
                ['Bilingual Fonts', '13 English + 17 Khmer Google Fonts'],
                ['Dark / Light', 'Smooth theme toggle with transitions'],
                ['Custom Accents', '12 presets + custom color picker'],
                ['Table of Contents', 'Auto-linked heading anchors'],
                ['Export HTML/PDF/Word', 'Self-contained HTML, A4 PDF, .doc'],
                ['Copy HTML', 'One-click render to clipboard'],
                ['Review Mode', 'Distraction-free full-screen reading'],
                ['Responsive', 'Desktop, tablet, and mobile layouts'],
                ['Persistent', 'All settings saved to localStorage'],
              ].map(([label, desc]) => (
                <div key={label} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--accent)', fontSize: 10, marginTop: 3 }}>◆</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.4 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 4, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text2)', textAlign: 'center' }}>
              MIT &middot; v{APP_VERSION} &middot; Built with React 19 + TypeScript + Vite
            </div>
            <div style={{ marginTop: 6, fontSize: 11, textAlign: 'center' }}>
              <a href="https://github.com/Lachsokhour/merl.md" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                &#9733; Star on GitHub
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
