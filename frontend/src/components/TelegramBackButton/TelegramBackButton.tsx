import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

interface TelegramBackButtonProps {
  onClick?(): void
  hidden?: boolean
}

export const TelegramBackButton = ({
  hidden,
  onClick,
}: TelegramBackButtonProps) => {
  const webApp = window?.Telegram?.WebApp
  const backButton = webApp ? webApp?.BackButton : null

  const navigate = useNavigate()
  const location = useLocation()

  const handleClick = () => {
    const closeApp = !!location?.state?.closeApp
    if (hidden || closeApp) {
      return null
    }

    if (onClick) {
      onClick()
    } else {
      const toMainPage = !!location?.state?.toMainPage

      if (toMainPage) {
        navigate('/')
        return
      }
      navigate(-1)
    }
  }

  useEffect(() => {
    if (backButton) {
      backButton.show()
    }
  }, [])

  useEffect(() => {
    if (hidden) {
      if (backButton) {
        backButton.hide()
      }
    }
  }, [hidden])

  useEffect(() => {
    webApp?.onEvent('backButtonClicked', handleClick)

    return () => {
      webApp?.offEvent('backButtonClicked', handleClick)
    }
  }, [handleClick])

  return null
}
