import { forwardRef } from 'react'

interface EditorProps {
  value: string
  onChange: (value: string) => void
}

export default forwardRef<HTMLTextAreaElement, EditorProps>(
  function Editor({ value, onChange }, ref) {
    return (
      <textarea
        ref={ref}
        className="editor-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your markdown here..."
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    )
  }
)
