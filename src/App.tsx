import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import Toolbar from './components/Toolbar'
import Editor from './components/Editor'
import Preview from './components/Preview'
import { buildGoogleFontsUrl } from './fonts'
import type { FileHandle } from './types'

const DEMO_CONTENT = `# សួស្តី merl.md ✨

A lightweight markdown previewer with a clean UI.
ជាកម្មវិធីមើល markdown ស្រាលៗ ជាមួយ UI ស្អាត។

## អក្សរ / Typography

**Bold** / **ដិត**, *Italic* / *ទ្រេត*, ~~strikethrough~~, and \`inline code\`.

## Lists

### Unordered
- Item one
- Item two
  - Nested item

### Task List
- [x] សរសេរ markdown
- [ ] មើលការផ្លាស់ប្តូរផ្ទាល់
- [ ] ប្តូរពណ៌តាមចិត្ត

## Code

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}! 👋\`
}
\`\`\`

## Blockquote

> ការរៀនសូត្រគឺជាកំណប់ដែលនឹងតាមអ្នកគ្រប់ទីកន្លែង។

## Table

| Feature | ភាពអាចប្រើ |
|---------|------------|
| GFM | ✅ |
| Syntax Highlighting | ✅ |
| Mermaid Diagrams | ✅ |
| Dark Mode | ✅ |

## Mermaid

\`\`\`mermaid
flowchart LR
  A[Start] --> B{Is it working?}
  B -->|Yes| C[Great! ✅]
  B -->|No| D[Fix it 🔧]
  D --> B
\`\`\`

---

*Start editing to see the live preview in action!*
*ចាប់ផ្តើមកែប្រែដើម្បីមើលការផ្លាស់ប្តូរផ្ទាល់!*
`

const LS = (k: string) => `merl.md.${k}`

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(LS(key))
    return raw !== null ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  localStorage.setItem(LS(key), JSON.stringify(value))
}

export default function App() {
  const [content, setContent] = useState(DEMO_CONTENT)
  const [theme, setTheme] = useState<'light' | 'dark'>(load('theme', 'light'))
  const [fileName, setFileName] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor')
  const [englishFont, setEnglishFont] = useState(load('englishFont', 'Inter'))
  const [khmerFont, setKhmerFont] = useState(load('khmerFont', 'Noto Sans Khmer'))
  const [previewFontSize, setPreviewFontSize] = useState(load('previewFontSize', 16))
  const [splitPos, setSplitPos] = useState(load('splitPos', 50))
  const [accentColor, setAccentColor] = useState<string | null>(load<string | null>('accentColor', null))
  const containerRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme) }, [])
  useEffect(() => { save('theme', theme) }, [theme])

  useEffect(() => {
    const url = buildGoogleFontsUrl(englishFont, khmerFont)
    const linkId = 'merl-google-fonts'
    let link = document.getElementById(linkId) as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.id = linkId
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
    link.href = url
  }, [englishFont, khmerFont])

  useEffect(() => {
    document.documentElement.style.setProperty('--font-english', `'${englishFont}', system-ui, sans-serif`)
    document.documentElement.style.setProperty('--font-khmer', `'${khmerFont}', sans-serif`)
    document.documentElement.style.setProperty('--font', `var(--font-english), var(--font-khmer)`)
    save('englishFont', englishFont)
    save('khmerFont', khmerFont)
  }, [englishFont, khmerFont])

  useEffect(() => {
    document.documentElement.style.setProperty('--preview-font-size', `${previewFontSize}px`)
    save('previewFontSize', previewFontSize)
  }, [previewFontSize])

  useEffect(() => { save('splitPos', splitPos) }, [splitPos])

  useEffect(() => {
    if (accentColor) {
      document.documentElement.style.setProperty('--accent', accentColor)
      const hex = parseInt(accentColor.slice(1), 16)
      const r = Math.round(((hex >> 16) & 255) * 0.85)
      const g = Math.round(((hex >> 8) & 255) * 0.85)
      const b = Math.round((hex & 255) * 0.85)
      const hover = `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
      document.documentElement.style.setProperty('--accent-hover', hover)
    } else {
      document.documentElement.style.removeProperty('--accent')
      document.documentElement.style.removeProperty('--accent-hover')
    }
    save('accentColor', accentColor)
  }, [accentColor])

  const handleDividerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    dragging.current = true
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()

    function getX(ev: MouseEvent | TouchEvent) {
      return 'touches' in ev ? ev.touches[0].clientX : ev.clientX
    }

    function onMove(ev: MouseEvent | TouchEvent) {
      if (!dragging.current || !containerRef.current) return
      const r = containerRef.current.getBoundingClientRect()
      const x = getX(ev) - r.left
      const pct = Math.min(85, Math.max(15, (x / rect.width) * 100))
      setSplitPos(pct)
    }

    function onUp() {
      dragging.current = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('touchend', onUp)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', next)
      return next
    })
  }, [])

  const handleOpenFile = useCallback((file: FileHandle) => {
    setContent(file.content)
    setFileName(file.name)
  }, [])

  const handleClear = useCallback(() => {
    setContent('')
    setFileName(null)
  }, [])

  const handleDownloadHtml = useCallback(() => {
    const innerHtml = previewRef.current?.innerHTML || ''
    const pageTitle = fileName?.replace(/\.\w+$/, '') || 'document'
    const isDark = theme === 'dark'
    const bg = isDark ? '#0f172a' : '#ffffff'
    const text = isDark ? '#f1f5f9' : '#1a1a2e'
    const text2 = isDark ? '#94a3b8' : '#64748b'
    const border = isDark ? '#334155' : '#e2e8f0'
    const surface2 = isDark ? '#334155' : '#f1f5f9'
    const accent = accentColor || (isDark ? '#818cf8' : '#6366f1')
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <link href="${buildGoogleFontsUrl(englishFont, khmerFont)}" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: '${englishFont}', '${khmerFont}', sans-serif;
      background: ${bg};
      color: ${text};
      max-width: 800px;
      margin: 0 auto;
      padding: 48px 32px;
      line-height: 1.75;
      font-size: 16px;
      -webkit-font-smoothing: antialiased;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.8em;
      margin-bottom: 0.4em;
      font-weight: 700;
      line-height: 1.3;
      letter-spacing: -0.02em;
    }
    h1 { font-size: 2.2em; border-bottom: 2px solid ${border}; padding-bottom: 0.3em; }
    h2 { font-size: 1.65em; padding-bottom: 0.25em; border-bottom: 1px solid ${border}; }
    h3 { font-size: 1.3em; }
    h4 { font-size: 1.1em; }
    h5 { font-size: 1em; color: ${text2}; }
    h6 { font-size: 0.9em; color: ${text2}; font-weight: 400; }
    p { margin: 0.85em 0; }
    a { color: ${accent}; text-decoration: none; font-weight: 500; }
    a:hover { text-decoration: underline; }
    img { max-width: 100%; border-radius: 10px; margin: 1.2em 0; display: block; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    hr { border: none; height: 1px; margin: 2.5em 0; background: linear-gradient(90deg, transparent, ${border}, transparent); }
    blockquote {
      margin: 1.2em 0;
      padding: 0.8em 1.2em 0.8em 1.8em;
      position: relative;
      background: ${surface2};
      border-radius: 8px;
      color: ${text2};
    }
    blockquote::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: ${accent};
      border-radius: 2px 0 0 2px;
    }
    blockquote p { margin: 0.35em 0; }
    blockquote p:first-child::before { content: '\\201C'; font-size: 1.4em; font-weight: 700; color: ${accent}; margin-right: 4px; opacity: 0.6; }
    ul, ol { margin: 0.7em 0; padding-left: 1.8em; }
    li { margin: 0.35em 0; line-height: 1.7; }
    li::marker { color: ${accent}; }
    ul > li::marker { content: '\\2022'; font-size: 1.15em; }
    ul ul > li::marker { content: '\\25E6'; font-size: 1.1em; }
    ul ul ul > li::marker { content: '\\25AA'; font-size: 0.9em; }
    ol > li::marker { font-weight: 600; font-size: 0.9em; }
    li > ul, li > ol { margin: 0.15em 0; }
    ul:has(input[type="checkbox"]), ol:has(input[type="checkbox"]) { list-style: none; padding-left: 0; }
    li:has(input[type="checkbox"]) { position: relative; padding-left: 28px; list-style: none; }
    li:has(input[type="checkbox"])::marker { content: '' !important; }
    input[type="checkbox"] {
      appearance: none; -webkit-appearance: none;
      position: absolute; left: 0; top: 0.35em;
      width: 18px; height: 18px;
      border: 2px solid ${border};
      border-radius: 5px;
      margin: 0;
      cursor: default;
      background: ${bg};
    }
    input[type="checkbox"]:checked {
      background: ${accent};
      border-color: ${accent};
    }
    input[type="checkbox"]:checked::after {
      content: '';
      position: absolute;
      left: 4.5px; top: 1px;
      width: 5px; height: 9px;
      border: solid #fff;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
    pre {
      margin: 1.4em 0;
      padding: 48px 24px 20px;
      border-radius: 12px;
      background: #0f172a;
      overflow-x: auto;
      font-size: 13.5px;
      line-height: 1.6;
      border: 1px solid rgba(255,255,255,0.1);
      position: relative;
      box-shadow: 0 2px 12px rgba(0,0,0,0.18);
      tab-size: 2;
      font-variant-ligatures: none;
    }
    pre::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 36px;
      background: rgba(255,255,255,0.03);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px 12px 0 0;
    }
    pre::before {
      content: '';
      position: absolute;
      left: 16px; top: 13px;
      width: 11px; height: 11px;
      border-radius: 50%;
      background: #ef4444;
      box-shadow: 19px 0 0 #fbbf24, 38px 0 0 #22c55e;
      z-index: 1;
    }
    pre code {
      background: none !important;
      padding: 0 !important;
      font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
      color: #e2e8f0 !important;
      font-size: 13.5px;
      line-height: 1.6;
    }
    code:not(pre code) {
      background: color-mix(in srgb, ${accent} 10%, ${surface2});
      padding: 2px 7px;
      border-radius: 5px;
      font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
      font-size: 0.88em;
      color: ${accent};
      border: 1px solid ${border};
    }
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 1.2em 0;
      font-size: 14px;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid ${border};
      box-shadow: 0 1px 4px rgba(0,0,0,0.03);
    }
    th, td {
      padding: 11px 16px;
      border-bottom: 1px solid ${border};
      text-align: left;
    }
    th {
      background: ${surface2};
      font-weight: 600;
      font-size: 0.85em;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: ${text2};
    }
    tr:last-child td { border-bottom: none; }
    tbody tr:hover { background: color-mix(in srgb, ${accent} 4%, ${bg}); }
    kbd {
      padding: 2px 8px;
      border: 1px solid ${border};
      border-radius: 5px;
      background: ${bg};
      font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
      font-size: 0.85em;
      box-shadow: 0 1px 0 ${border};
    }
    .mermaid {
      margin: 1.6em 0;
      padding: 24px;
      border-radius: 12px;
      background: color-mix(in srgb, ${accent} 4%, ${bg});
      border: 1px solid color-mix(in srgb, ${accent} 20%, ${border});
      display: flex;
      justify-content: center;
      overflow-x: auto;
    }
    .mermaid svg {
      max-width: 100%;
      height: auto;
      display: block;
    }
    .hljs { background: transparent !important; color: #e2e8f0; }
    .hljs-keyword { color: #c678dd; }
    .hljs-string { color: #98c379; }
    .hljs-number { color: #d19a66; }
    .hljs-title { color: #61aeee; }
    .hljs-built_in { color: #56b6c2; }
    .hljs-attr { color: #e6c07b; }
    .hljs-params { color: #abb2bf; }
    .hljs-comment { color: #5c6370; }
    .hljs-function { color: #61aeee; }
  </style>
</head>
<body>
${innerHtml}
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const d = new Date()
    const ts = String(d.getFullYear()) +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0') + '-' +
      String(d.getHours()).padStart(2, '0') +
      String(d.getMinutes()).padStart(2, '0') +
      String(d.getSeconds()).padStart(2, '0')
    a.download = ts + '-merl-md.html'
    a.click()
    URL.revokeObjectURL(url)
  }, [fileName, englishFont, khmerFont, theme, accentColor])

  const chars = useMemo(() => content.length, [content])
  const words = useMemo(() => {
    const trimmed = content.trim()
    return trimmed ? trimmed.split(/\s+/).length : 0
  }, [content])

  return (
    <div className="app-root">
      <Toolbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenFile={handleOpenFile}
        onDownloadHtml={handleDownloadHtml}
        chars={chars}
        words={words}
        fileName={fileName}
        englishFont={englishFont}
        khmerFont={khmerFont}
        onChangeEnglishFont={setEnglishFont}
        onChangeKhmerFont={setKhmerFont}
        previewFontSize={previewFontSize}
        onChangePreviewFontSize={setPreviewFontSize}
        accentColor={accentColor}
        onChangeAccentColor={setAccentColor}
      />

      <div className="mobile-tabs">
        <button
          className={`mobile-tab ${mobileTab === 'editor' ? 'active' : ''}`}
          onClick={() => setMobileTab('editor')}
        >
          Editor
        </button>
        <button
          className={`mobile-tab ${mobileTab === 'preview' ? 'active' : ''}`}
          onClick={() => setMobileTab('preview')}
        >
          Preview
        </button>
      </div>

      <div ref={containerRef} className="app-container">
        <div
          className={`pane ${mobileTab !== 'editor' ? 'mobile-hidden' : ''}`}
          style={{ width: `${splitPos}%`, flex: 'none' }}
        >
          <div className="pane-header">
            <span>Editor</span>
            <div className="pane-header-right">
              {fileName && <span className="pane-header-file">{fileName}</span>}
              <button className="pane-header-clear" onClick={handleClear} title="Clear content">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          <Editor value={content} onChange={setContent} />
        </div>

        <div
          className="pane-divider"
          onMouseDown={handleDividerDown}
          onTouchStart={handleDividerDown}
        />

        <div className={`pane ${mobileTab !== 'preview' ? 'mobile-hidden' : ''}`}>
          <div className="pane-header">
            <span>Preview</span>
            <span style={{ fontWeight: 400, textTransform: 'none' }}>Live</span>
          </div>
          <div ref={previewRef} className="pane-content">
            <Preview content={content} theme={theme} />
          </div>
        </div>
      </div>
    </div>
  )
}
