import { Group, GroupItem, Image, Text } from '@components'
import { ChatPopular } from '@types'
import { createMembersCount } from '@utils'

interface PopularChatsListProps {
  chats: ChatPopular[]
}

export const PopularChatsList = ({ chats }: PopularChatsListProps) => {
  return (
    <Group>
      {chats.map((chat) => (
        <GroupItem
          key={chat.id}
          text={chat.title}
          description={
            <Text type="caption2" color="secondary">
              {createMembersCount(chat.membersCount)}
            </Text>
          }
          chevron
          before={
            <Image
              src={chat.logoPath}
              size={40}
              borderRadius={50}
              fallback={chat.title}
            />
          }
        />
      ))}
    </Group>
  )
}
