import React, { useCallback, useContext, useState, memo } from 'react'
import { createPortal } from 'react-dom'

import { ToastElement, ToastOptions } from './ToastElement'

const ToastContainer = memo(({ toasts }: any) => {
  return createPortal(
    toasts.map((item: any) => (
      <ToastElement key={item.id} id={item.id} options={item.options}>
        {item.options.message}
      </ToastElement>
    )),
    document.body
  )
})

interface ToastContextInterface {
  showToast: (options: ToastOptions) => void
  hideToast: (id: string | number) => void
  hideToasts: () => void
}

const ToastContext = React.createContext<ToastContextInterface>({
  showToast: (options: ToastOptions) => {},
  hideToast: (id: string | number) => {},
  hideToasts: () => {},
})

let id = 1

export function ToastProvider({ children }: any) {
  const [toasts, setToasts] = useState<any>([])

  const showToast = useCallback((options: any) => {
    const newToast = {
      id: id++,
      options,
    }
    setToasts((prevToasts: any) => [...prevToasts, newToast])
  }, [])

  const hideToast = useCallback((id: any) => {
    setToasts((prevToasts: any) => prevToasts.filter((t: any) => t.id !== id))
  }, [])

  const hideToasts = useCallback(() => {
    setToasts([])
  }, [])

  const contextValue = React.useMemo(
    () => ({
      showToast,
      hideToast,
      hideToasts,
    }),
    [showToast, hideToast, hideToasts]
  )

  return (
    <ToastContext.Provider value={contextValue}>
      <ToastContainer toasts={toasts} />
      {children}
    </ToastContext.Provider>
  )
}

const useToast = () => {
  const toastHelpers = useContext(ToastContext)
  return toastHelpers
}

export { ToastContext, useToast }
export default ToastProvider
