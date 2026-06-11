import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  handleReset = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: '48px 24px',
          textAlign: 'center',
        }}>
          <AlertTriangle size={32} strokeWidth={1.5} opacity={0.5} />
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
            Something went wrong
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)', maxWidth: 400, lineHeight: 1.5 }}>
            {this.state.error.message}
          </div>
          <button
            onClick={this.handleReset}
            style={{
              marginTop: 4,
              padding: '8px 20px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface2)',
              color: 'var(--text)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
