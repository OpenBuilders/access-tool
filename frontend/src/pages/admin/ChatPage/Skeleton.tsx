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
        style={{ width: '70%', height: '34px', margin: '12px auto 0' }}
      />
      <SkeletonElement
        style={{ width: '30%', height: '16px', margin: '8px auto 0' }}
      />
      <SkeletonElement
        style={{ width: '100%', height: '200px', marginTop: '24px' }}
      />
      <SkeletonElement
        style={{ width: '100%', height: '40px', marginTop: '24px' }}
      />
    </Block>
  )
}
