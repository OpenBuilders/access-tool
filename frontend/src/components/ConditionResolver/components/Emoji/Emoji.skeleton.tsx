import { GroupSkeleton, BlockNew } from '@components'

export const EmojiSkeleton = () => {
  return (
    <BlockNew padding="24px 0 0 0">
      <GroupSkeleton rows={1} />
    </BlockNew>
  )
}
