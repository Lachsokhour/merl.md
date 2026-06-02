interface EditorProps {
  value: string
  onChange: (value: string) => void
}

export default function Editor({ value, onChange }: EditorProps) {
  return (
    <textarea
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
