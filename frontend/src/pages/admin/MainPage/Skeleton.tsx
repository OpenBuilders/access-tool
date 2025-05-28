import { Block, SkeletonElement } from '@components'

export const Skeleton = () => {
  return (
    <Block>
      <SkeletonElement
        style={{
          width: '112px',
          height: '112px',
          margin: '0 auto',
          borderRadius: '50%',
        }}
      />
      <SkeletonElement
        style={{ width: '70%', height: '68px', margin: '8px auto 0' }}
      />
      <SkeletonElement
        style={{ width: '100%', height: '200px', margin: '24px auto 0' }}
      />
    </Block>
  )
}
