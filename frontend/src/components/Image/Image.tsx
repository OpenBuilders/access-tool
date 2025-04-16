import cn from 'classnames'

import config from '@config'

import styles from './Image.module.scss'

interface ImageProps {
  src?: string | null
  size: 24 | 40 | 112
  borderRadius?: 50 | 12 | 8
}

export const Image = ({ src, size, borderRadius }: ImageProps) => {
  if (!src)
    return (
      <div
        className={cn(
          styles.emptyImage,
          borderRadius && styles[`border-radius-${borderRadius}`]
        )}
        style={{
          width: size,
          height: size,
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
