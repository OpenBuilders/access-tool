import { BlockNew, GroupSkeleton } from '@components'

export const JettonsSkeleton = () => {
  return (
    <>
      <BlockNew padding="24px 0 0 0">
        <GroupSkeleton rows={1} />
      </BlockNew>
      <BlockNew padding="24px 0 0 0">
        <GroupSkeleton rows={1} />
      </BlockNew>
      <BlockNew padding="24px 0 0 0">
        <GroupSkeleton rows={1} />
      </BlockNew>
    </>
  )
}
