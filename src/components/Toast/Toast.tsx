import { Text } from '@telegram-apps/telegram-ui'
import React, { useCallback, useContext, useState } from 'react'
import { createPortal } from 'react-dom'

import { ToastElement, ToastOptions } from './ToastElement'

const ToastContainer = ({ toasts }: any) => {
  return createPortal(
    toasts.map((item: any) => (
      <ToastElement key={item.id} id={item.id} options={item.options}>
        {item.options.message}
      </ToastElement>
    )),
    document.body
  )
}

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

  const showToast = useCallback(
    (options: any) => {
      setToasts(() => [
        {
          id: id++,
          options,
        },
      ])
    },
    [setToasts]
  )

  const hideToast = useCallback(
    (id: any) => {
      setToasts((toasts: any) => toasts.filter((t: any) => t.id !== id))
    },
    [setToasts]
  )

  const hideToasts = useCallback(() => {
    setToasts([])
  }, [setToasts])

  return (
    <ToastContext.Provider
      value={{
        showToast,
        hideToast,
        hideToasts,
      }}
    >
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
