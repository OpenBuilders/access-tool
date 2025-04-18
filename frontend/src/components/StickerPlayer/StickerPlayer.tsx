import Lottie from 'lottie-react'
import { useRef } from 'react'

interface StickerPlayerProps {
  lottie: string
  height?: number
  width?: number
}

export const StickerPlayer = ({
  lottie,
  height = 112,
  width = 112,
}: StickerPlayerProps) => {
  const ref = useRef(null)

  return (
    <Lottie
      lottieRef={ref}
      loop
      autoplay
      animationData={lottie}
      style={{ height, width }}
    />
  )
}
