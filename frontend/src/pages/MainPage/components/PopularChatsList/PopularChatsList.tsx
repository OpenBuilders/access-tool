import { BlockNew, Group, GroupItem, Image, Text } from '@components'
import { ChatPopular } from '@types'
import { hapticFeedback, pluralize } from '@utils'
import { useNavigate } from 'react-router-dom'

import { Footer } from '../Footer'
import styles from './PopularChatsList.module.scss'

interface PopularChatsListProps {
  chats: ChatPopular[]
}

export const PopularChatsList = ({ chats }: PopularChatsListProps) => {
  const navigate = useNavigate()

  return (
    <BlockNew id="explore-container">
      <Group>
        {chats.map((chat) => (
          <GroupItem
            key={chat.id}
            text={chat.title}
            description={
              <BlockNew gap={6} row align="center" fadeIn={false}>
                <Text type="caption2" color="secondary">
                  {pluralize(
                    ['member', 'members', 'members'],
                    chat.membersCount
                  )}
                </Text>
              </BlockNew>
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
      <Footer />
    </BlockNew>
  )
}
