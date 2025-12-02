import { SkeletonElement, TextType } from '@components'

interface TextSkeletonProps {
  width?: number
  type: TextType
}

const HEIGHT_BY_TYPE = {
  hero: 34,
  title: 28,
  title1: 26,
  title2: 24,
  text: 17,
  link: 17,
  caption: 13,
  caption2: 14,
}

export const TextSkeleton = ({ width = 20, type }: TextSkeletonProps) => {
  const height = HEIGHT_BY_TYPE[type]
  return (
    <SkeletonElement
      style={{
        width: `${width}%`,
        height: `${height}px`,
        borderRadius: 'var(--border-radius-sm)',
      }}
    />
  )
}
