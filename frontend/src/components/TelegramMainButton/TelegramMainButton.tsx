import { useEffect, useCallback } from 'react'

interface MainButtonProps {
  text: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  color?: string
  textColor?: string
  isVisible?: boolean
}

export const TelegramMainButton = ({
  text,
  onClick,
  disabled = false,
  loading = false,
  color,
  textColor,
  isVisible = true,
}: MainButtonProps) => {
  const webApp = window.Telegram?.WebApp

  const setupButton = useCallback(() => {
    if (!webApp?.MainButton) return

    webApp.MainButton.text = text
    if (color) webApp.MainButton.color = color
    if (textColor) webApp.MainButton.textColor = textColor

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

    if (isVisible) {
      webApp.MainButton.show()
    } else {
      webApp.MainButton.hide()
    }
  }, [webApp, text, color, textColor, disabled, loading, isVisible])

  useEffect(() => {
    if (!webApp?.MainButton) return

    setupButton()

    webApp.MainButton.onClick(onClick)

    return () => {
      webApp.MainButton.offClick(onClick)
      webApp.MainButton.hide()
    }
  }, [webApp, onClick, setupButton])

  if (
    webApp.platform === 'unknown' &&
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
