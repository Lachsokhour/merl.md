import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { ClipboardPaste, Trash2, FileUp } from 'lucide-react'
import Toolbar from './components/Toolbar'
import Editor from './components/Editor'
import Preview from './components/Preview'
import ErrorBoundary from './components/ErrorBoundary'
import ReviewMode from './components/ReviewMode'
import Toast from './components/Toast'
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

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

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
  try {
    localStorage.setItem(LS(key), JSON.stringify(value))
  } catch { /* localStorage full or unavailable */ }
}

export default function App() {
  const is404 = (() => {
    const path = window.location.pathname.replace(/\/+$/, '') || '/'
    const base = (document.querySelector('base')?.getAttribute('href') || '/').replace(/\/+$/, '') || '/'
    return path !== base && path !== '/index.html'
  })()

  const [content, setContent] = useState(load('content', '') || DEMO_CONTENT)
  const [theme, setTheme] = useState<'light' | 'dark'>(load('theme', 'light'))
  const [fileName, setFileName] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor')
  const [englishFont, setEnglishFont] = useState(load('englishFont', 'Inter'))
  const [khmerFont, setKhmerFont] = useState(load('khmerFont', 'Google Sans'))
  const [previewFontSize, setPreviewFontSize] = useState(load('previewFontSize', 16))
  const [splitPos, setSplitPos] = useState(load('splitPos', 50))
  const [accentColor, setAccentColor] = useState<string | null>(load<string | null>('accentColor', null))
  const [reviewMode, setReviewMode] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const dragging = useRef(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const dragCounter = useRef(0)

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme) }, [theme])
  useEffect(() => { save('theme', theme) }, [theme])

  useEffect(() => { save('content', content) }, [content])

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

  const toggleReviewMode = useCallback(() => {
    setReviewMode(prev => !prev)
  }, [])

  const handleOpenFile = useCallback((file: FileHandle) => {
    setContent(file.content)
    setFileName(file.name)
    setToast(`Opened ${file.name}`)
  }, [])

  const handleClear = useCallback(() => {
    setContent('')
    setFileName(null)
    setToast('Content cleared')
  }, [])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (!text) return
      const el = editorRef.current
      if (el) {
        const start = el.selectionStart
        const end = el.selectionEnd
        const before = content.slice(0, start)
        const after = content.slice(end)
        setContent(before + text + after)
        requestAnimationFrame(() => {
          el.focus()
          el.selectionStart = el.selectionEnd = start + text.length
        })
      } else {
        setContent(content + text)
      }
      setToast('Pasted from clipboard')
    } catch { /* clipboard read denied */ }
  }, [content])

  const hideToast = useCallback(() => { setToast(null) }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current += 1
    if (dragCounter.current === 1) {
      setIsDragOver(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current = Math.max(0, dragCounter.current - 1)
    if (dragCounter.current === 0) {
      setIsDragOver(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    dragCounter.current = 0
    const files = Array.from(e.dataTransfer.files)
    const mdFile = files.find(f => f.name.endsWith('.md'))
    if (!mdFile) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      setContent(text)
      setFileName(mdFile.name)
    }
    reader.readAsText(mdFile)
  }, [])

  const generateHtml = useCallback(() => {
    const previewEl = previewRef.current
    if (!previewEl) return null
    const clone = previewEl.cloneNode(true) as HTMLElement
    clone.querySelectorAll('.block-header, .scroll-to-top, .collapse-icon').forEach(el => el.remove())
    clone.querySelectorAll('.mermaid-wrap').forEach(el => {
      if (el.querySelector(':scope > .mermaid-header')) {
        const parent = el.parentNode
        if (parent) {
          while (el.firstChild) parent.insertBefore(el.firstChild, el)
          el.remove()
        }
      }
    })
    clone.querySelectorAll('.mermaid-header').forEach(el => el.remove())
    const innerHtml = clone.innerHTML
    const pageTitle = fileName?.replace(/\.\w+$/, '') || 'document'
    const isDark = theme === 'dark'
    const bg = isDark ? '#0f172a' : '#ffffff'
    const text = isDark ? '#f1f5f9' : '#1a1a2e'
    const text2 = isDark ? '#94a3b8' : '#64748b'
    const border = isDark ? '#334155' : '#e2e8f0'
    const surface2 = isDark ? '#334155' : '#f1f5f9'
    const accent = accentColor || (isDark ? '#818cf8' : '#6366f1')
    return `<!DOCTYPE html>
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
      line-height: 1.7;
      font-size: 16px;
      -webkit-font-smoothing: antialiased;
      scroll-behavior: smooth;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.2em;
      margin-bottom: 0.3em;
      font-weight: 700;
      line-height: 1.3;
      letter-spacing: -0.02em;
    }
    h1 { font-size: 1.8em; border-bottom: 2px solid ${border}; padding-bottom: 0.2em; }
    h2 { font-size: 1.4em; padding-bottom: 0.15em; border-bottom: 1px solid ${border}; }
    h3 { font-size: 1.15em; }
    h4 { font-size: 1em; }
    h5 { font-size: 0.9em; color: ${text2}; }
    h6 { font-size: 0.85em; color: ${text2}; font-weight: 400; }
    :is(h1,h2,h3,h4,h5,h6):target { animation: heading-highlight 2s ease-out; }
    @keyframes heading-highlight { 0% { background-color: color-mix(in srgb, ${accent} 20%, transparent); } 100% { background-color: transparent; } }
    p { margin: 0.65em 0; }
    a { color: ${accent}; text-decoration: none; font-weight: 500; }
    a:hover { text-decoration: underline; }
    img { max-width: 100%; border-radius: 8px; margin: 0.85em 0; display: block; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    hr { border: none; height: 1px; margin: 1.5em 0; background: linear-gradient(90deg, transparent, ${border}, transparent); }
    blockquote {
      margin: 0.85em 0;
      padding: 0.8em 1.2em 0.8em 1.8em;
      position: relative;
      background: ${surface2};
      border-radius: 8px;
      color: ${text2};
      font-size: 0.95em;
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
    blockquote[data-alert] {
      padding: 0.85em 1.2em 0.85em 2.8em;
      border: 1px solid color-mix(in srgb, var(--alert-color) 30%, ${border});
      border-left: 4px solid var(--alert-color);
      background: color-mix(in srgb, var(--alert-color) 6%, ${bg});
    }
    blockquote[data-alert]::before { display: none; }
    blockquote[data-alert] .alert-icon {
      position: absolute;
      left: 14px;
      top: 1.1em;
      width: 18px;
      height: 18px;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    }
    blockquote[data-alert] > p.alert-title { font-weight: 700; font-size: 0.7em; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.5em; color: var(--alert-color); }
    blockquote[data-alert] > p:last-child { margin-bottom: 0; }
    blockquote[data-alert="NOTE"] { --alert-color: #3b82f6; }
    blockquote[data-alert="NOTE"] .alert-icon { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233b82f6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M12 16v-4'/%3E%3Cpath d='M12 8h.01'/%3E%3C/svg%3E"); }
    blockquote[data-alert="TIP"] { --alert-color: #22c55e; }
    blockquote[data-alert="TIP"] .alert-icon { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2322c55e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 18h6'/%3E%3Cpath d='M10 22h4'/%3E%3Cpath d='M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14'/%3E%3C/svg%3E"); }
    blockquote[data-alert="IMPORTANT"] { --alert-color: #8b5cf6; }
    blockquote[data-alert="IMPORTANT"] .alert-icon { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238b5cf6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M12 8v4'/%3E%3Cpath d='M12 16h.01'/%3E%3C/svg%3E"); }
    blockquote[data-alert="WARNING"] { --alert-color: #f59e0b; }
    blockquote[data-alert="WARNING"] .alert-icon { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23f59e0b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 9v4'/%3E%3Cpath d='M12 17h.01'/%3E%3Cpath d='M10.29 3.86l-8.1 14c-.6 1.04.15 2.14 1.21 2.14h16.2c1.06 0 1.81-1.1 1.21-2.14l-8.1-14c-.6-1.04-1.82-1.04-2.42 0'/%3E%3C/svg%3E"); }
    blockquote[data-alert="CAUTION"] { --alert-color: #ef4444; }
    blockquote[data-alert="CAUTION"] .alert-icon { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M15 9l-6 6'/%3E%3Cpath d='M9 9l6 6'/%3E%3C/svg%3E"); }
    ul, ol { margin: 0.5em 0; padding-left: 1.8em; }
    li { margin: 0.2em 0; line-height: 1.7; }
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
      margin: 1em 0;
      padding: 48px 24px 20px;
      border-radius: 12px;
      background: #0f172a;
      overflow: visible;
      font-size: 13.5px;
      line-height: 1.6;
      border: 1px solid rgba(255,255,255,0.1);
      position: relative;
      box-shadow: 0 2px 12px rgba(0,0,0,0.18);
      tab-size: 2;
      font-variant-ligatures: none;
      white-space: pre-wrap;
      word-break: break-word;
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
      margin: 0.9em 0;
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
      margin: 1em 0;
      padding: 16px 24px;
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
    .code-block-wrap { position: relative; }
  </style>
</head>
<body>
${innerHtml}
</body>
</html>`
  }, [fileName, englishFont, khmerFont, theme, accentColor])

  const handleDownloadHtml = useCallback(() => {
    const html = generateHtml()
    if (!html) return
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
  }, [generateHtml])

  const handleCopyHtml = useCallback(() => {
    const html = generateHtml()
    if (!html) return
    navigator.clipboard.writeText(html)
    setToast('HTML copied to clipboard')
  }, [generateHtml])

  const handleDownloadPdf = useCallback(() => {
    window.print()
  }, [])

  const generateWordHtml = useCallback(() => {
    const previewEl = previewRef.current
    if (!previewEl) return null
    const clone = previewEl.cloneNode(true) as HTMLElement
    clone.querySelectorAll('.block-header, .scroll-to-top, .collapse-icon').forEach(el => el.remove())
    clone.querySelectorAll('.mermaid-wrap').forEach(el => {
      if (el.querySelector(':scope > .mermaid-header')) {
        const parent = el.parentNode
        if (parent) {
          while (el.firstChild) parent.insertBefore(el.firstChild, el)
          el.remove()
        }
      }
    })
    clone.querySelectorAll('.mermaid-header').forEach(el => el.remove())
    const innerHtml = clone.innerHTML
    const pageTitle = fileName?.replace(/\.\w+$/, '') || 'document'
    const accent = accentColor || '#6366f1'
    return `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="UTF-8">
<title>${pageTitle}</title>
<link href="${buildGoogleFontsUrl(englishFont, khmerFont)}" rel="stylesheet">
<!--[if gte mso 9]>
<xml>
<w:WordDocument>
<w:View>Print</w:View>
<w:Zoom>100</w:Zoom>
</w:WordDocument>
</xml>
<![endif]-->
<style>
body { font-family: '${englishFont}', '${khmerFont}', sans-serif; margin: 0 auto; padding: 48px 32px; max-width: 800px; line-height: 1.7; font-size: 16px; color: #1a1a2e; }
h1, h2, h3, h4, h5, h6 { margin-top: 1.2em; margin-bottom: 0.3em; font-weight: 700; line-height: 1.3; }
h1 { font-size: 1.8em; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.2em; }
h2 { font-size: 1.4em; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.15em; }
h3 { font-size: 1.15em; }
h4 { font-size: 1em; }
h5 { font-size: 0.9em; color: #64748b; }
h6 { font-size: 0.85em; color: #64748b; font-weight: 400; }
p { margin: 0.65em 0; }
a { color: ${accent}; font-weight: 500; }
img { max-width: 100%; margin: 0.85em 0; }
blockquote { margin: 0.85em 0; padding: 0.8em 1.2em 0.8em 1.8em; background: #f1f5f9; border-left: 4px solid ${accent}; color: #64748b; font-size: 0.95em; }
blockquote p { margin: 0.35em 0; }
blockquote[data-alert] { padding: 0.85em 1.2em 0.85em 2.8em; border: 1px solid #ccc; border-left-width: 4px; }
blockquote[data-alert="NOTE"] { border-left-color: #3b82f6; }
blockquote[data-alert="TIP"] { border-left-color: #22c55e; }
blockquote[data-alert="IMPORTANT"] { border-left-color: #8b5cf6; }
blockquote[data-alert="WARNING"] { border-left-color: #f59e0b; }
blockquote[data-alert="CAUTION"] { border-left-color: #ef4444; }
.alert-title { font-weight: 700; font-size: 0.7em; text-transform: uppercase; color: ${accent}; }
ul, ol { margin: 0.5em 0; padding-left: 1.8em; }
li { margin: 0.2em 0; line-height: 1.7; }
pre {
  margin: 1em 0;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  background: #f4f4f4;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12pt;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
pre code {
  background: none !important;
  padding: 0 !important;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12pt;
  color: #1f2937 !important;
}
code:not(pre code) {
  background: #f1f5f9;
  padding: 2px 6px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.88em;
  color: ${accent};
  border: 1px solid #e2e8f0;
}
table { width: 100%; border-collapse: collapse; margin: 0.9em 0; font-size: 14px; border: 1px solid #e2e8f0; }
th, td { padding: 10px 14px; border: 1px solid #e2e8f0; text-align: left; }
th { background: #f1f5f9; font-weight: 600; }
hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.5em 0; }
.hljs { background: transparent !important; color: #1f2937; }
.hljs-keyword { color: #7c3aed; }
.hljs-string { color: #059669; }
.hljs-number { color: #d97706; }
.hljs-title { color: #2563eb; }
.hljs-built_in { color: #0891b2; }
.hljs-attr { color: #b45309; }
.hljs-params { color: #374151; }
.hljs-comment { color: #6b7280; font-style: italic; }
.hljs-function { color: #2563eb; }
kbd { padding: 2px 8px; border: 1px solid #e2e8f0; background: #fff; font-family: 'Courier New', Courier, monospace; font-size: 0.85em; }
.mermaid { text-align: center; padding: 16px; border: 1px solid #e2e8f0; background: #fafafa; margin: 1em 0; }
.mermaid svg { max-width: 100%; height: auto; }
</style>
</head>
<body>
${innerHtml}
</body>
</html>`
  }, [fileName, englishFont, khmerFont, accentColor])

  const handleDownloadWord = useCallback(() => {
    const html = generateWordHtml()
    if (!html) return
    const d = new Date()
    const ts = String(d.getFullYear()) +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0') + '-' +
      String(d.getHours()).padStart(2, '0') +
      String(d.getMinutes()).padStart(2, '0') +
      String(d.getSeconds()).padStart(2, '0')
    const blob = new Blob([html], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = ts + '-merl-md.doc'
    a.click()
    URL.revokeObjectURL(url)
  }, [generateWordHtml])

  const handleDownloadMd = useCallback(() => {
    const d = new Date()
    const ts = String(d.getFullYear()) +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0') + '-' +
      String(d.getHours()).padStart(2, '0') +
      String(d.getMinutes()).padStart(2, '0') +
      String(d.getSeconds()).padStart(2, '0')
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = ts + '-merl-md.md'
    a.click()
    URL.revokeObjectURL(url)
  }, [content])

  const chars = useMemo(() => content.length, [content])
  const words = useMemo(() => {
    const trimmed = content.trim()
    return trimmed ? trimmed.split(/\s+/).length : 0
  }, [content])

  if (is404) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16, padding: 32, textAlign: 'center', background: 'var(--bg)', color: 'var(--text)' }}>
        <div style={{ fontSize: 64, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>404</div>
        <div style={{ fontSize: 18, color: 'var(--text2)' }}>Page not found</div>
        <p style={{ fontSize: 14, color: 'var(--text2)', maxWidth: 360, lineHeight: 1.6 }}>
          The page you're looking for doesn't exist.
        </p>
        <a href="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>&larr; Back to merl.md</a>
      </div>
    )
  }

  return (
    <div className="app-root">
      {reviewMode ? (
        <ReviewMode
          content={content}
          theme={theme}
          onExit={toggleReviewMode}
          onToggleTheme={toggleTheme}
          previewFontSize={previewFontSize}
          onChangePreviewFontSize={setPreviewFontSize}
          englishFont={englishFont}
          khmerFont={khmerFont}
          onChangeEnglishFont={setEnglishFont}
          onChangeKhmerFont={setKhmerFont}
          accentColor={accentColor}
          onChangeAccentColor={setAccentColor}
        />
      ) : (
        <>
      <Toolbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenFile={handleOpenFile}
        onDownloadHtml={handleDownloadHtml}
        onDownloadMd={handleDownloadMd}
        onDownloadPdf={handleDownloadPdf}
        onDownloadWord={handleDownloadWord}
        onCopyHtml={handleCopyHtml}
        onToggleReview={toggleReviewMode}
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
          className={`pane ${mobileTab !== 'editor' ? 'mobile-hidden' : ''} ${isDragOver ? 'pane-dragover' : ''}`}
          style={{ width: `${splitPos}%`, flex: 'none' }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="pane-header">
            <span>Editor</span>
            <div className="pane-header-right">
              {fileName && <span className="pane-header-file">{fileName}</span>}
              <button className="pane-header-clear" onClick={handlePaste} title="Paste from clipboard">
                <ClipboardPaste size={15} />
              </button>
              <button className="pane-header-clear pane-header-danger" onClick={handleClear} title="Clear content">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
          <div className="pane-editor-wrap">
            <Editor ref={editorRef} value={content} onChange={setContent} />
            {isDragOver && (
              <div className="drop-overlay">
                <FileUp size={40} strokeWidth={1.5} />
                <span className="drop-overlay-label">Drop .md file here</span>
              </div>
            )}
          </div>
        </div>

        <div
          className="pane-divider"
          onMouseDown={handleDividerDown}
          onTouchStart={handleDividerDown}
        />

        <div className={`pane ${mobileTab !== 'preview' ? 'mobile-hidden' : ''}`}>
          <div className="pane-header">
            <span>Preview</span>
            <div className="pane-header-right" />
          </div>
          <div ref={previewRef} className="pane-content">
            <ErrorBoundary>
              <Preview content={content} theme={theme} />
            </ErrorBoundary>
          </div>
        </div>
      </div>
        </>
      )}
      {toast && <Toast message={toast} onDone={hideToast} />}
    </div>
  )
}
