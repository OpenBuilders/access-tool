import { SkeletonElement } from '@components'

interface GroupSkeletonProps {
  rows?: number
}

export const GroupSkeleton = ({ rows = 1 }: GroupSkeletonProps) => {
  const height = 50 * rows
  return (
    <SkeletonElement
      style={{
        height,
        width: '100%',
        borderRadius: 'var(--border-radius-3xl)',
      }}
    />
  )
}
