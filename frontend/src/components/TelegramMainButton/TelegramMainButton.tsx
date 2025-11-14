import { useEffect, memo } from 'react'
import { useLocation } from 'react-router-dom'

interface MainButtonProps {
  text: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  color?: string
  textColor?: string
  isVisible?: boolean
}

export const TelegramMainButton = memo(
  ({
    text,
    onClick,
    disabled = false,
    loading = false,
    color,
    textColor,
    isVisible = true,
  }: MainButtonProps) => {
    const webApp = window.Telegram?.WebApp
    const location = useLocation()

    useEffect(() => {
      if (!webApp?.MainButton) return

      webApp.MainButton.setParams({
        text: text || 'Continue',
        color,
        text_color: textColor,
      })

      webApp.MainButton.onClick(onClick)

      if (isVisible && text) {
        webApp.MainButton.show()
      } else {
        webApp.MainButton.hide()
      }
      return () => {
        webApp.MainButton.offClick(onClick)
        webApp.MainButton.hide()
      }
    }, [location.pathname])

    useEffect(() => {
      if (!webApp?.MainButton) return

      webApp.MainButton.setParams({
        text: text || 'Continue',
        color,
        text_color: textColor,
      })

      if (disabled || loading) {
        webApp.MainButton.disable()
      } else {
        webApp.MainButton.enable()
      }

      if (loading) {
        webApp.MainButton.showProgress()
      } else {
        webApp.MainButton.hideProgress()
      }
    }, [disabled, loading, text])

    useEffect(() => {
      if (webApp?.MainButton && onClick) {
        webApp?.MainButton.onClick(onClick)

        return () => {
          if (webApp?.MainButton) {
            webApp?.MainButton.offClick(onClick)
          }
        }
      }
    }, [onClick])

    if (
      webApp?.platform === 'unknown' &&
      process.env.NODE_ENV !== 'production' &&
      isVisible
    ) {
      return (
        <button
          onClick={onClick}
          style={{
            width: '100%',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10000000000000000,
            height: '56px',
          }}
          disabled={disabled}
        >
          {text}
        </button>
      )
    }

    return null
  }
)
