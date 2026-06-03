import { Upload, Download, Moon, Sun, Minus, Plus, ChevronRight } from 'lucide-react'
import type { FileHandle } from '../types'
import FontSettings from './FontSettings'
import AccentPicker from './AccentPicker'
import AboutOverlay from './AboutOverlay'

interface ToolbarProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onOpenFile: (file: FileHandle) => void
  onDownloadHtml: () => void
  chars: number
  words: number
  fileName: string | null
  englishFont: string
  khmerFont: string
  onChangeEnglishFont: (font: string) => void
  onChangeKhmerFont: (font: string) => void
  previewFontSize: number
  onChangePreviewFontSize: (size: number) => void
  accentColor: string | null
  onChangeAccentColor: (color: string | null) => void
}

export default function Toolbar({
  theme,
  onToggleTheme,
  onOpenFile,
  onDownloadHtml,
  chars,
  words,
  fileName,
  englishFont,
  khmerFont,
  onChangeEnglishFont,
  onChangeKhmerFont,
  previewFontSize,
  onChangePreviewFontSize,
  accentColor,
  onChangeAccentColor,
}: ToolbarProps) {
  function handleOpen() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.markdown,.mdown,.mkd,text/markdown'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const content = await file.text()
      onOpenFile({ name: file.name, content })
    }
    input.click()
  }

  return (
    <header className="toolbar">
      <div className="toolbar-brand">
        <span className="brand-khmer">មើល .md</span>
        <ChevronRight className="brand-sep" size={18} />
        <span>merl.md</span>
        {fileName && <small>{fileName}</small>}
      </div>

      <div className="toolbar-scroll">
        <button className="toolbar-btn" onClick={handleOpen} title="Open .md file">
          <Upload size={15} />
          <span className="toolbar-btn-label">Open</span>
        </button>

        <button className="toolbar-btn" onClick={onDownloadHtml} title="Download as HTML">
          <Download size={15} />
          <span className="toolbar-btn-label">HTML</span>
        </button>

        <FontSettings
          englishFont={englishFont}
          khmerFont={khmerFont}
          onChangeEnglish={onChangeEnglishFont}
          onChangeKhmer={onChangeKhmerFont}
        />

        <AccentPicker accentColor={accentColor} onChangeAccentColor={onChangeAccentColor} />

        <AboutOverlay />

        <div className="toolbar-group">
          <button
            className="toolbar-btn toolbar-btn-icon"
            onClick={() => onChangePreviewFontSize(Math.max(12, previewFontSize - 1))}
            disabled={previewFontSize <= 12}
            title="Decrease font size"
          >
            <Minus size={14} />
          </button>
          <span className="toolbar-size-label">{previewFontSize}px</span>
          <button
            className="toolbar-btn toolbar-btn-icon"
            onClick={() => onChangePreviewFontSize(Math.min(24, previewFontSize + 1))}
            disabled={previewFontSize >= 24}
            title="Increase font size"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          className="toolbar-btn"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          <span className="toolbar-btn-label">{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>

        <span className="toolbar-stats">
          {words} words · {chars} chars
        </span>
      </div>
    </header>
  )
}
