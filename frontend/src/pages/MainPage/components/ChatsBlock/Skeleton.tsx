import { SkeletonElement } from '@components'

export const Skeleton = () => {
  return (
    <div
      style={{
        width: '100%',
        overflow: 'hidden',
        height: '70vh',
        padding: '0 16px',
      }}
    >
      <SkeletonElement
        style={{
          overflow: 'hidden',
          width: '100%',
          height: '100%',
          borderRadius: '10px',
        }}
      />
    </div>
  )
}
