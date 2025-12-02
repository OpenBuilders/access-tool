import { BlockNew, GroupSkeleton } from '@components'

export const GiftsSkeleton = () => {
  return (
    <>
      <BlockNew padding="24px 0 0 0">
        <GroupSkeleton rows={1} />
      </BlockNew>
      <BlockNew padding="24px 0 0 0">
        <GroupSkeleton rows={3} />
      </BlockNew>
      <BlockNew padding="24px 0 0 0">
        <GroupSkeleton rows={1} />
      </BlockNew>
    </>
  )
}
