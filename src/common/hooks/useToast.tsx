import { Snackbar } from '@telegram-apps/telegram-ui'
import { useState } from 'react'
import { createPortal } from 'react-dom'

interface ShowToastProps {
  description: string
  icon?: 'success' | 'error'
}

export const useToast = () => {
  const [isOpen, setIsOpen] = useState(false)

  return {
    showToast: ({ description, icon }: ShowToastProps) => {
      setIsOpen(true)

      if (!isOpen) return null
      return createPortal(
        <Snackbar
          description={description}
          after={icon || undefined}
          onClose={() => setIsOpen(false)}
        >
          Gdsfgsdf
        </Snackbar>,
        document.body
      )
    },
  }
}
