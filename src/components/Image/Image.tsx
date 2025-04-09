import cn from 'classnames'

import config from '@config'

import styles from './Image.module.scss'

interface ImageProps {
  src: string
  size: 24 | 40 | 112
  borderRadius?: 50 | 12
}

export const Image = ({ src, size, borderRadius }: ImageProps) => {
  if (!src)
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        😔
      </div>
    )
  const url = `${config.CDN}/${src}`
  return (
    <img
      src={url}
      alt="image"
      width={size}
      height={size}
      className={cn(borderRadius && styles[`border-radius-${borderRadius}`])}
    />
  )
}
