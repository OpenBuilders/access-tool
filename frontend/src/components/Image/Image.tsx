import cn from 'classnames'

import { SkeletonElement } from '../SkeletonElement'
import styles from './Image.module.scss'
import { getColor, getFirstLetter } from './helpers'

interface ImageProps {
  fallback?: string
  src?: string | null
  size: 24 | 40 | 112
  borderRadius?: 50 | 12 | 8
}

export const Image = ({ src, size, borderRadius, fallback }: ImageProps) => {
  if (!src) {
    if (fallback) {
      const firstLetter = getFirstLetter(fallback)
      const color = getColor(firstLetter)
      return (
        <div
          className={styles.fallback}
          style={{
            background: color,
            minWidth: size,
            minHeight: size,
          }}
        >
          <p
            style={{
              fontSize: `${size / 2}px`,
            }}
            className={styles.fallbackText}
          >
            {firstLetter}
          </p>
        </div>
      )
    }
    return (
      <SkeletonElement
        style={{
          minWidth: size,
          minHeight: size,
          borderRadius: borderRadius ? `${borderRadius}px` : '0px',
        }}
      />
    )
  }

  const srcUrl = src.includes('https://')
    ? src
    : `https://pub-afc0b291195b4529b0de88319506f30b.r2.dev/${src}`

  return (
    <img
      src={srcUrl}
      alt="image"
      width={size}
      height={size}
      className={cn(borderRadius && styles[`border-radius-${borderRadius}`])}
    />
  )
}
