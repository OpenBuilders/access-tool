import { SkeletonElement } from '@components'

export const Skeleton = () => {
  return (
    <div
      style={{
        flex: '1',
        minHeight: '0',
        display: 'flex',
        width: '100%',
        padding: '0 16px',
      }}
    >
      <SkeletonElement
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '10px',
        }}
      />
    </div>
  )
}
