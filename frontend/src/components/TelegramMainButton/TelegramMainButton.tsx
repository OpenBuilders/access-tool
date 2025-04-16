import { useEffect } from 'react'

interface MainButtonProps {
  text?: string
  onClick?: () => void
  hidden?: boolean
  disabled?: boolean
  isLoading?: boolean
}

const webApp = window.Telegram?.WebApp
const mainButton = webApp?.MainButton

export const TelegramMainButton = ({
  text,
  onClick,
  hidden,
  disabled,
  isLoading,
}: MainButtonProps) => {
  const resetButton = () => {
    if (mainButton) {
      const { button_color, button_text_color } = webApp.themeParams

      if (disabled) {
        mainButton.disable()
      } else {
        mainButton.enable()
      }

      mainButton.hideProgress()
      mainButton.setParams({
        color: button_color,
        text_color: button_text_color,
      })
    }
  }

  useEffect(() => {
    resetButton()
  }, [])

  useEffect(() => {
    if (mainButton) {
      if (hidden) {
        mainButton.hide()
        resetButton()
      } else {
        mainButton.show()
        resetButton()
      }
    }
  }, [hidden])

  useEffect(() => {
    if (!mainButton) {
      return
    }

    const { button_color, button_text_color } = webApp.themeParams

    if (typeof isLoading === 'boolean') {
      if (isLoading) {
        mainButton.showProgress()
        mainButton.disable()
      } else {
        mainButton.hideProgress()
      }
    }

    if (typeof disabled === 'boolean') {
      if (disabled) {
        mainButton.disable()
        mainButton.setParams({ color: '#E8E8E9', text_color: '#B9B9BA' })
      } else {
        mainButton.enable()
        mainButton.setParams({
          color: button_color,
          text_color: button_text_color,
        })
      }
    }
  }, [disabled, isLoading])

  useEffect(() => {
    if (!mainButton) {
      return
    }

    if (text) {
      mainButton.setText(text)
      if (!mainButton.isVisible) {
        mainButton.show()
      }
    } else if (mainButton.isVisible) {
      mainButton.hide()
    }
  }, [text])

  useEffect(() => {
    if (mainButton && onClick) {
      mainButton.onClick(onClick)

      return () => {
        if (mainButton) {
          mainButton.offClick(onClick)
        }
      }
    }
  }, [onClick])

  if (
    webApp.platform === 'unknown' &&
    process.env.NODE_ENV !== 'production' &&
    !hidden
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
