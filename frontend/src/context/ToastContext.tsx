import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

type ToastVariant = 'success' | 'error' | 'info' | 'warning'

type Toast = {
  id: string
  title: string
  message?: string
  variant: ToastVariant
}

type ConfirmToast = Toast & {
  confirmLabel: string
  cancelLabel: string
  resolve: (value: boolean) => void
}

type ToastInput = {
  title: string
  message?: string
  variant?: ToastVariant
}

type ConfirmToastInput = ToastInput & {
  confirmLabel?: string
  cancelLabel?: string
}

type ToastContextValue = {
  showToast: (toast: ToastInput) => void
  confirmToast: (toast: ConfirmToastInput) => Promise<boolean>
}

const ToastContext = createContext<ToastContextValue | null>(null)
const toastDuration = 4200

function createToastId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [confirmToasts, setConfirmToasts] = useState<ConfirmToast[]>([])
  const timers = useRef<Record<string, number>>({})

  const removeToast = useCallback((toastId: string) => {
    window.clearTimeout(timers.current[toastId])
    delete timers.current[toastId]
    setToasts((current) => current.filter((toast) => toast.id !== toastId))
  }, [])

  const showToast = useCallback(
    ({ title, message, variant = 'info' }: ToastInput) => {
      const id = createToastId()
      setToasts((current) => [...current, { id, title, message, variant }].slice(-5))
      timers.current[id] = window.setTimeout(() => removeToast(id), toastDuration)
    },
    [removeToast],
  )

  const confirmToast = useCallback(({ title, message, variant = 'warning', confirmLabel = 'Confirm', cancelLabel = 'Cancel' }: ConfirmToastInput) => {
    return new Promise<boolean>((resolve) => {
      const id = createToastId()
      setConfirmToasts((current) => [
        ...current,
        {
          id,
          title,
          message,
          variant,
          confirmLabel,
          cancelLabel,
          resolve,
        },
      ])
    })
  }, [])

  const resolveConfirm = (toast: ConfirmToast, value: boolean) => {
    toast.resolve(value)
    setConfirmToasts((current) => current.filter((item) => item.id !== toast.id))
  }

  const value = useMemo(() => ({ showToast, confirmToast }), [confirmToast, showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {confirmToasts.map((toast) => (
          <section className={`toast-card ${toast.variant}`} key={toast.id}>
            <div>
              <strong>{toast.title}</strong>
              {toast.message && <p>{toast.message}</p>}
            </div>
            <div className="toast-actions">
              <button className="toast-button secondary" type="button" onClick={() => resolveConfirm(toast, false)}>
                {toast.cancelLabel}
              </button>
              <button className="toast-button primary" type="button" onClick={() => resolveConfirm(toast, true)}>
                {toast.confirmLabel}
              </button>
            </div>
          </section>
        ))}
        {toasts.map((toast) => (
          <section className={`toast-card ${toast.variant}`} key={toast.id}>
            <div>
              <strong>{toast.title}</strong>
              {toast.message && <p>{toast.message}</p>}
            </div>
            <button className="toast-close" type="button" aria-label="Dismiss notification" onClick={() => removeToast(toast.id)}>
              x
            </button>
          </section>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider')
  }

  return context
}
