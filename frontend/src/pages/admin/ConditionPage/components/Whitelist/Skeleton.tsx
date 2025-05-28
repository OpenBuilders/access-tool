import { Block, SkeletonElement } from '@components'

export const Skeleton = () => {
  return (
    <Block>
      <SkeletonElement
        style={{ width: '100%', height: '40px', marginTop: '24px' }}
      />
      <SkeletonElement
        style={{ width: '100%', height: '10px', marginTop: '6px' }}
      />
      <SkeletonElement
        style={{ width: '100%', height: '10px', marginTop: '3px' }}
      />
      <SkeletonElement
        style={{ width: '100%', height: '10px', marginTop: '3px' }}
      />
    </Block>
  )
}
