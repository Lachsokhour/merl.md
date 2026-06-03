import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ToastProps {
  message: string
  onDone: () => void
}

export default function Toast({ message, onDone }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2000)
    return () => clearTimeout(timer)
  }, [onDone])

  return createPortal(
    <div className="toast">{message}</div>,
    document.body
  )
}
