import { Image, Text, Block } from '@components'

import { useChat } from '@store'

export const ChatHeader = () => {
  const { chat } = useChat()

  return (
    <>
      <Image size={112} src={chat?.logoPath} borderRadius={50} />
      <Block margin="top" marginValue={12}>
        <Text type="title" align="center" weight="bold">
          {chat?.title}
        </Text>
      </Block>
      <Block margin="top" marginValue={8}>
        <Text type="text" align="center" color="tertiary">
          {chat?.description}
        </Text>
      </Block>
    </>
  )
}
