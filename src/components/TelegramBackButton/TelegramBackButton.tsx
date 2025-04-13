import { memo, useEffect } from 'react'

interface TelegramBackButtonProps {
  onClick?: () => void
}

const TelegramBackButtonMemo = ({ onClick }: TelegramBackButtonProps) => {
  useEffect(() => {
    const webApp = window.Telegram?.WebApp
    if (!webApp || !onClick) return

    webApp.BackButton.show()

    const handleBackButtonClick = () => {
      if (onClick) {
        onClick()
      }
    }

    webApp.BackButton.onClick(handleBackButtonClick)

    return () => {
      webApp.BackButton.offClick(handleBackButtonClick)
      webApp.BackButton.hide()
    }
  }, [onClick])

  return null
}

export const TelegramBackButton = memo(TelegramBackButtonMemo)
