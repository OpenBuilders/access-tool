import { Image, Text, Block } from '@components'
import { createMembersCount } from '@utils'

import { useChat } from '@store'

export const ChatHeader = () => {
  const { chat } = useChat()

  return (
    <>
      <Image
        size={112}
        src={chat?.logoPath}
        borderRadius={50}
        fallback={chat?.title}
      />
      <Block margin="top" marginValue={12}>
        <Text type="title" align="center" weight="bold">
          {chat?.title}
        </Text>
      </Block>
      {chat?.membersCount && (
        <Block margin="top" marginValue={8}>
          <Text type="caption2" color="tertiary" align="center">
            {createMembersCount(chat?.membersCount)}
          </Text>
        </Block>
      )}
      <Block margin="top" marginValue={8}>
        <Text type="text" align="center" color="tertiary">
          {chat?.description}
        </Text>
      </Block>
    </>
  )
}
