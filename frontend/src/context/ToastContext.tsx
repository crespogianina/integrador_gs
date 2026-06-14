import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const styles = {
  success: 'bg-herb/10 border-herb/30 text-herb',
  error: 'bg-spice/10 border-spice/30 text-spice',
  info: 'bg-gold/10 border-gold/30 text-gold',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[min(90vw,360px)] pointer-events-none">
        {toasts.map(({ id, message, type }) => {
          const Icon = icons[type]
          return (
            <div
              key={id}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border shadow-lg backdrop-blur-sm animate-fade-up pointer-events-auto ${styles[type]}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
              <p className="font-body text-sm font-medium">{message}</p>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
  return ctx
}
