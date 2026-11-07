/* eslint-disable react-refresh/only-export-components -- provider, hook and context are one unit, same shape as auth.jsx */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const ToastContext = createContext(() => {})

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null)
  const timer = useRef(null)

  const show = useCallback((message) => {
    setMsg(message)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMsg(null), 2500)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      {msg && (
        <div className="toast show">
          <span>✅</span>
          <span>{msg}</span>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
