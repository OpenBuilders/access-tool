import { memo, useEffect, useRef } from 'react'

interface TelegramBackButtonProps {
  onClick?: () => void
  hidden?: boolean
}

const TelegramBackButtonMemo = ({
  onClick,
  hidden,
}: TelegramBackButtonProps) => {
  const onClickRef = useRef(onClick)

  useEffect(() => {
    onClickRef.current = onClick
  }, [onClick])

  useEffect(() => {
    const webApp = window.Telegram?.WebApp
    if (!webApp || !onClickRef.current || hidden) return

    const handleBackButtonClick = () => {
      onClickRef.current?.()
    }

    webApp.BackButton.show()
    webApp.BackButton.onClick(handleBackButtonClick)

    return () => {
      webApp.BackButton.offClick(handleBackButtonClick)
      webApp.BackButton.hide()
    }
  }, [])

  return null
}

export const TelegramBackButton = memo(TelegramBackButtonMemo)
