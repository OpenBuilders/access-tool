import { useWindowSize } from '@uidotdev/usehooks'
import { useEffect, useState } from 'react'
import Confetti from 'react-confetti'

interface ConfettiAnimationProps {
  active: boolean
  duration?: number
  height?: number
  width?: number
}

const DURATION = 2500

const webApp = window?.Telegram?.WebApp

export const ConfettiAnimation = (props: ConfettiAnimationProps) => {
  const { width: windowWith, height: windowHeight } = useWindowSize()

  const {
    active,
    duration = DURATION,
    width = windowWith,
    height = windowHeight,
  } = props

  const [isConfettiRecycled, setIsConfettiRecycled] = useState(true)

  useEffect(() => {
    if (active) {
      webApp?.HapticFeedback?.impactOccurred('soft')

      const timer = setTimeout(() => {
        setIsConfettiRecycled(false)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [active])

  if (!width || !height) return null

  return (
    <Confetti
      width={width}
      height={height}
      numberOfPieces={300}
      recycle={isConfettiRecycled}
      style={{ zIndex: 1000000 }}
    />
  )
}
