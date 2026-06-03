import React, { useEffect, useRef, useState, useCallback } from 'react'
import { FileText, Copy, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { visit } from 'unist-util-visit'
import mermaid from 'mermaid'

interface PreviewProps {
  content: string
  theme: 'light' | 'dark'
}

function rehypeMermaid() {
  return (tree: any) => {
    visit(tree, 'element', (node: any) => {
      if (node.tagName === 'code' && node.properties?.className?.includes('language-mermaid')) {
        node.tagName = 'div'
        node.properties.className = ['mermaid']
      }
    })
  }
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false)
  const preRef = useRef<HTMLPreElement>(null)
  const child = React.Children.only(children) as React.ReactElement<{ className?: string }>
  const lang = child.props.className?.replace('language-', '') || ''

  const handleCopy = useCallback(async () => {
    const text = preRef.current?.textContent || ''
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [])

  return (
    <div className="code-block-wrap">
      <pre ref={preRef}>{children}</pre>
      <div className="code-block-header">
        <span className="code-lang">{lang}</span>
        <button className="code-copy-btn" onClick={handleCopy} title="Copy code">
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  )
}

export default function Preview({ content, theme }: PreviewProps) {
  const initialized = useRef(false)

  useEffect(() => {
    if (!content.trim()) return
    const mermaidConfig = {
      startOnLoad: false,
      theme: (theme === 'dark' ? 'dark' : 'default') as 'dark' | 'default',
      themeVariables: {
        background: 'transparent',
        ...(theme === 'dark'
          ? {
              primaryColor: '#818cf8',
              primaryTextColor: '#f1f5f9',
              primaryBorderColor: '#6366f1',
              lineColor: '#818cf8',
              secondaryColor: '#475569',
              tertiaryColor: '#1e293b',
              textColor: '#94a3b8',
              edgeLabelBackground: '#334155',
              clusterBkg: '#1e293b',
              clusterBorder: '#475569',
              titleColor: '#f1f5f9',
            }
          : {}),
      },
    }
    mermaid.initialize(mermaidConfig)
    if (!initialized.current) {
      initialized.current = true
    }
    const timer = requestAnimationFrame(() => {
      document.querySelectorAll('.preview .mermaid').forEach(el => {
        if (el.hasAttribute('data-source')) {
          el.textContent = el.getAttribute('data-source')
        } else {
          el.setAttribute('data-source', el.textContent || '')
        }
        el.removeAttribute('data-processed')
      })
      mermaid.run({ querySelector: '.preview .mermaid' })
    })
    return () => cancelAnimationFrame(timer)
  }, [content, theme])

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
    <div className="preview">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeMermaid, rehypeHighlight]}
        components={{
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
