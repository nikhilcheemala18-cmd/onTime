import { useCallback, useMemo, useState } from 'react'
import { CheckCircle2, X, XCircle } from './icons.jsx'
import Button from './Button.jsx'
import { ToastContext } from './toastContext.js'

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((toast) => {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, tone: 'success', ...toast }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id))
    }, toast.duration || 3500)
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((item) => item.id !== id))
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="rounded-lg border border-line bg-white p-3 shadow-lg">
            <div className="flex items-start gap-3">
              {toast.tone === 'error' ? (
                <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">{toast.title}</p>
                {toast.message && <p className="mt-0.5 text-sm text-ink-500">{toast.message}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
