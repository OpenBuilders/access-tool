import { SkeletonElement } from '@components'

export const ButtonSkeleton = () => {
  return (
    <SkeletonElement
      style={{
        width: '100%',
        height: '50px',
        borderRadius: 'var(--border-radius-3xl)',
      }}
    />
  )
}
