import { SkeletonElement } from '@components'

interface ImageSkeletonProps {
  width?: number
  height?: number
  borderRadius?: number
}

export const ImageSkeleton = ({
  width = 100,
  height = 100,
  borderRadius,
}: ImageSkeletonProps) => {
  return (
    <SkeletonElement
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: borderRadius ? `${borderRadius}px` : '50%',
      }}
    />
  )
}
