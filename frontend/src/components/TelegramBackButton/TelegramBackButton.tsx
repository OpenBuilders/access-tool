import { memo, useEffect, useCallback } from 'react'

interface TelegramBackButtonProps {
  onClick?: () => void
}

const TelegramBackButtonMemo = ({ onClick }: TelegramBackButtonProps) => {
  const handleBackButtonClick = useCallback(() => {
    if (onClick) {
      onClick()
    }
  }, [onClick])

  useEffect(() => {
    const webApp = window.Telegram?.WebApp
    if (!webApp || !onClick) return

    webApp.BackButton.show()
    webApp.BackButton.onClick(handleBackButtonClick)

    return () => {
      webApp.BackButton.offClick(handleBackButtonClick)
      webApp.BackButton.hide()
    }
  }, [handleBackButtonClick])

  return null
}

export const TelegramBackButton = memo(TelegramBackButtonMemo)
