import {
  ImageSkeleton,
  BlockNew,
  TextSkeleton,
  ButtonSkeleton,
} from '@components'

export const ChatHeaderSkeleton = () => {
  return (
    <BlockNew justify="center" align="center">
      <ImageSkeleton width={112} height={112} borderRadius={100} />
      <BlockNew padding="12px 0 0 0" justify="center" align="center" gap={6}>
        <TextSkeleton type="title" width={50} />
        <TextSkeleton type="text" width={30} />
      </BlockNew>
      <BlockNew
        padding="24px 0 0 0"
        justify="between"
        align="center"
        row
        gap={10}
      >
        <ButtonSkeleton />
        <ButtonSkeleton />
      </BlockNew>
    </BlockNew>
  )
}
