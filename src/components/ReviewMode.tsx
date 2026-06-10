import { useEffect, useRef, useState } from 'react'
import { Moon, Sun, Minus, Plus, EyeOff } from 'lucide-react'
import Preview from './Preview'
import FontSettings from './FontSettings'
import AccentPicker from './AccentPicker'

interface ReviewModeProps {
  content: string
  theme: 'light' | 'dark'
  onExit: () => void
  onToggleTheme: () => void
  previewFontSize: number
  onChangePreviewFontSize: (size: number) => void
  englishFont: string
  khmerFont: string
  onChangeEnglishFont: (font: string) => void
  onChangeKhmerFont: (font: string) => void
  accentColor: string | null
  onChangeAccentColor: (color: string | null) => void
}

export default function ReviewMode({
  content,
  theme,
  onExit,
  onToggleTheme,
  previewFontSize,
  onChangePreviewFontSize,
  englishFont,
  khmerFont,
  onChangeEnglishFont,
  onChangeKhmerFont,
  accentColor,
  onChangeAccentColor,
}: ReviewModeProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onExit()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onExit])

  useEffect(() => {
    const el = contentRef.current?.querySelector('.preview') as HTMLElement | null
    if (!el) return
    function onScroll() {
      const pct = el!.scrollTop / (el!.scrollHeight - el!.clientHeight)
      setProgress(Math.min(1, Math.max(0, pct || 0)))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const title = (() => {
    const m = content.match(/^#\s+(.+)/m)
    return m ? m[1].replace(/[`*_~]/g, '').trim() : ''
  })()

  return (
    <div className="review-mode">
      <div className="review-progress" style={{ transform: `scaleX(${progress})` }} />
      <div className="review-body">
        <div className="review-content-wrap">
          {title && <div className="review-title">{title}</div>}
      <div ref={contentRef} className="review-content">
        <Preview content={content} theme={theme} />
      </div>
    </div>
    <div className="review-sidebar">
      <div className="review-sidebar-inner">
        <FontSettings
          compact
          englishFont={englishFont}
          khmerFont={khmerFont}
          onChangeEnglish={onChangeEnglishFont}
          onChangeKhmer={onChangeKhmerFont}
        />
        <AccentPicker compact accentColor={accentColor} onChangeAccentColor={onChangeAccentColor} theme={theme} />
        <div className="review-sidebar-group">
          <button
            className="review-sidebar-btn"
            onClick={() => onChangePreviewFontSize(Math.max(12, previewFontSize - 1))}
            disabled={previewFontSize <= 12}
            title="Decrease font size"
          >
            <Minus size={16} />
          </button>
          <span className="review-sidebar-size">{previewFontSize}</span>
          <button
            className="review-sidebar-btn"
            onClick={() => onChangePreviewFontSize(Math.min(24, previewFontSize + 1))}
            disabled={previewFontSize >= 24}
            title="Increase font size"
          >
            <Plus size={16} />
          </button>
        </div>
        <button className="review-sidebar-btn" onClick={onToggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button className="review-sidebar-btn" onClick={onExit} title="Exit review mode (Esc)">
          <EyeOff size={18} />
        </button>
      </div>
    </div>
  </div>
  <div className="review-bottom-bar">
    <button className="review-bottom-btn" onClick={onExit} title="Exit review mode (Esc)">
      <EyeOff size={16} />
    </button>
    <span className="review-bottom-sep" />
    <FontSettings
      compact
      englishFont={englishFont}
      khmerFont={khmerFont}
      onChangeEnglish={onChangeEnglishFont}
      onChangeKhmer={onChangeKhmerFont}
    />
    <AccentPicker compact accentColor={accentColor} onChangeAccentColor={onChangeAccentColor} theme={theme} />
    <span className="review-bottom-sep" />
    <button
      className="review-bottom-btn"
      onClick={() => onChangePreviewFontSize(Math.max(12, previewFontSize - 1))}
      disabled={previewFontSize <= 12}
      title="Decrease font size"
    >
      <Minus size={16} />
    </button>
    <span className="review-bottom-size">{previewFontSize}</span>
    <button
      className="review-bottom-btn"
      onClick={() => onChangePreviewFontSize(Math.min(24, previewFontSize + 1))}
      disabled={previewFontSize >= 24}
      title="Increase font size"
    >
      <Plus size={16} />
    </button>
    <span className="review-bottom-sep" />
    <button className="review-bottom-btn" onClick={onToggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  </div>
</div>
  )
}
