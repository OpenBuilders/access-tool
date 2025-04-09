import { useEffect } from 'react'

interface TelegramBackButtonProps {
  onClick?: () => void
}

export const TelegramBackButton: React.FC<TelegramBackButtonProps> = ({
  onClick,
}) => {
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
