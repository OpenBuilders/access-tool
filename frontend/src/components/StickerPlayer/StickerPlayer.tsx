import Lottie from 'react-lottie'

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
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: lottie,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  }

  return <Lottie options={defaultOptions} height={height} width={width} />
}
