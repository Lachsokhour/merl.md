import React, { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { FileText, Copy, Check, RotateCw, ArrowUp, ChevronDown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import mermaid from 'mermaid'
import rehypeAlert from '../rehype/alert'
import rehypeSectionize from '../rehype/sectionize'
import rehypeMermaid from '../rehype/mermaid'

const MERMAID_DEFAULT_CONFIG = {
  startOnLoad: false,
  theme: 'default' as const,
  themeVariables: { background: 'transparent' },
}
mermaid.initialize(MERMAID_DEFAULT_CONFIG)

interface PreviewProps {
  content: string
  theme: 'light' | 'dark'
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false)
  const preRef = useRef<HTMLPreElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const child = React.Children.only(children) as React.ReactElement<{ className?: string }>
  const lang = child.props.className?.replace('language-', '') || ''

  const handleCopy = useCallback(async () => {
    const text = preRef.current?.textContent || ''
    await navigator.clipboard.writeText(text)
    setCopied(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 1500)
  }, [])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <div className="code-block-wrap">
      <pre ref={preRef}>{children}</pre>
      <div className="block-header">
        <span className="block-lang code-lang">{lang}</span>
        <button className="block-action-btn code-copy-btn" onClick={handleCopy} title="Copy code">
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  )
}

function MermaidBlock({ children, theme }: { children: React.ReactNode; theme: 'light' | 'dark' }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [tick, setTick] = useState(0)

  const handleReload = useCallback(() => {
    setTick(n => n + 1)
  }, [])

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    let el = wrap.querySelector<HTMLElement>('.mermaid')
    if (!el) return

    let src = el.getAttribute('data-source')

    if (!src) {
      const text = el.textContent || ''
      if (!text.trim()) return
      el.setAttribute('data-source', text)
      src = text
    }

    if (tick > 0) {
      const newEl = document.createElement('div')
      newEl.className = 'mermaid'
      newEl.textContent = src
      newEl.setAttribute('data-source', src)
      el.replaceWith(newEl)
      el = newEl
    } else {
      el.textContent = src
    }

    el.removeAttribute('data-processed')
    mermaid.run({ nodes: [el] }).catch(err => console.warn('Mermaid error:', err))
  }, [tick, theme])

  return (
    <div className="mermaid-wrap" ref={wrapRef}>
      <div className="mermaid-header">
        <span className="block-lang mermaid-lang">Mermaid</span>
        <button className="block-action-btn mermaid-reload-btn" onClick={handleReload} title="Reload this diagram">
          <RotateCw size={13} />
          <span>Reload</span>
        </button>
      </div>
      {children}
    </div>
  )
}

function CollapsibleSection({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const toggle = useCallback(() => setCollapsed(c => !c), [])
  const childrenArr = React.Children.toArray(children)
  const headingIdx = childrenArr.findIndex(
    child => React.isValidElement(child) && typeof child.type === 'string' && /^h[1-6]$/.test(child.type)
  )
  if (headingIdx === -1) return <section>{children}</section>
  const heading = childrenArr[headingIdx] as React.ReactElement<React.HTMLAttributes<HTMLElement>>
  const content = childrenArr.slice(headingIdx + 1)
  return (
    <section data-collapsed={collapsed || undefined}>
      {React.cloneElement(heading, { onClick: toggle, className: `collapsible-heading${collapsed ? ' collapsed' : ''}` },
        <ChevronDown key="collapse-icon" size={16} className={`collapse-icon${collapsed ? ' collapsed' : ''}`} />,
        ...React.Children.toArray(heading.props.children),
      )}
      <div className="section-content" hidden={collapsed}>
        {content}
      </div>
    </section>
  )
}

function ScrollToTop({ previewRef }: { previewRef: React.RefObject<HTMLDivElement | null> }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = previewRef.current
    if (!el) return
    const onScroll = () => setShow(el.scrollTop > 300)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [previewRef])

  const handleClick = useCallback(() => {
    previewRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [previewRef])

  if (!show) return null
  return createPortal(
    <button className="scroll-to-top" onClick={handleClick} title="Scroll to top">
      <ArrowUp size={18} />
    </button>,
    document.body
  )
}

export default React.memo(function Preview({ content, theme }: PreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: (theme === 'dark' ? 'dark' : 'default') as 'dark' | 'default',
      themeVariables: {
        background: 'transparent',
        ...(theme === 'dark'
          ? {
              primaryColor: '#312e81',
              primaryTextColor: '#e2e8f0',
              primaryBorderColor: '#6366f1',
              lineColor: '#818cf8',
              secondaryColor: '#1e293b',
              tertiaryColor: '#0f172a',
              textColor: '#94a3b8',
              edgeLabelBackground: 'transparent',
              clusterBkg: '#1e293b',
              clusterBorder: '#475569',
              titleColor: '#f1f5f9',
              nodeBorder: '#6366f1',
              mainBkg: '#312e81',
              nodeTextColor: '#e2e8f0',
            }
          : {
              primaryColor: '#ede9fe',
              primaryTextColor: '#3730a3',
              primaryBorderColor: '#6366f1',
              lineColor: '#6366f1',
              secondaryColor: '#e0e7ff',
              tertiaryColor: '#f8fafc',
              textColor: '#374151',
              edgeLabelBackground: '#f9fafb',
              titleColor: '#1e293b',
            }),
      },
    })
  }, [theme])

  if (!content.trim()) {
    return (
      <div className="preview">
        <div className="preview-empty">
          <FileText size={48} strokeWidth={1.5} opacity={0.3} />
          <p>Start typing markdown on the left to see a live preview here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="preview" ref={previewRef}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeAlert, rehypeMermaid, rehypeSectionize, rehypeSlug, rehypeHighlight]}
        components={{
          section: ({ children }) => <CollapsibleSection>{children}</CollapsibleSection>,
          blockquote: ({ node, children }) => {
            const properties = (node as unknown as Record<string, unknown>)?.properties as Record<string, string> | undefined
            const alertType = properties?.alertType
            if (alertType) {
              return (
                <blockquote data-alert={alertType}>
                  <span className="alert-icon" />
                  {children}
                </blockquote>
              )
            }
            return <blockquote>{children}</blockquote>
          },
          div: ({ className, children, ...rest }) => {
            if (className === 'mermaid-wrap') {
              return <MermaidBlock theme={theme}>{children}</MermaidBlock>
            }
            return <div className={className} {...rest}>{children}</div>
          },
          pre: ({ children }) => {
            const arr = React.Children.toArray(children)
            if (arr.length === 1) {
              const child = arr[0] as React.ReactElement<{ className?: string }>
              const cls = child?.props?.className ?? ''
              if (typeof cls === 'string' && cls.includes('mermaid')) return <>{children}</>
            }
            return <CodeBlock>{children}</CodeBlock>
          },
        }}
      >
        {content}
      </ReactMarkdown>
      <ScrollToTop previewRef={previewRef} />
    </div>
  )
})
