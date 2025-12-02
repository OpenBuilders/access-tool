import { BlockNew, GroupSkeleton } from '@components'

export const PremiumSkeleton = () => {
  return (
    <BlockNew padding="24px 0 0 0">
      <GroupSkeleton rows={2} />
    </BlockNew>
  )
}
