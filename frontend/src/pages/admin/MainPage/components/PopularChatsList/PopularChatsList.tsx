import { Group, GroupItem, Image, Text } from '@components'
import { ChatPopular } from '@types'
import { createMembersCount, hapticFeedback } from '@utils'
import { useNavigate } from 'react-router-dom'

interface PopularChatsListProps {
  chats: ChatPopular[]
}

export const PopularChatsList = ({ chats }: PopularChatsListProps) => {
  const navigate = useNavigate()
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
          onClick={() => {
            hapticFeedback('soft')
            navigate(`/client/${chat.slug}`)
          }}
        />
      ))}
    </Group>
  )
}
