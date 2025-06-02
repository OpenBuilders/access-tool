import { Block, SkeletonElement } from '@components'

export const Skeleton = () => {
  return (
    <Block>
      <SkeletonElement
        style={{ width: '100%', height: '100px', marginTop: '24px' }}
      />
      <SkeletonElement
        style={{ width: '100%', height: '120px', marginTop: '24px' }}
      />
      <SkeletonElement
        style={{ width: '100%', height: '40px', marginTop: '24px' }}
      />
    </Block>
  )
}
