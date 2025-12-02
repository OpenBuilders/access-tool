import {
  BlockNew,
  ChatHeaderSkeleton,
  GroupSkeleton,
  TextSkeleton,
} from '@components'

export const AdminChatPageSkeleton = () => {
  return (
    <>
      <ChatHeaderSkeleton />
      <BlockNew padding="24px 0 0 0">
        <GroupSkeleton rows={1} />
      </BlockNew>
      <BlockNew padding="24px 0 0 0">
        <GroupSkeleton rows={3} />
      </BlockNew>
      <BlockNew padding="24px 0 0 0">
        <GroupSkeleton rows={1} />
      </BlockNew>
      <BlockNew margin="24px 0 0 0" align="center" justify="center">
        <TextSkeleton type="caption" width={80} />
      </BlockNew>
      <BlockNew margin="4px 0 0 0" align="center" justify="center">
        <TextSkeleton type="caption" width={30} />
      </BlockNew>
    </>
  )
}
