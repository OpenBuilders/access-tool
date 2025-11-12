import lockLottie from '@assets/lock.json'
import {
  Block,
  BlockNew,
  Group,
  GroupItem,
  Image,
  StickerPlayer,
  Text,
} from '@components'
import { AdminChat } from '@types'
import { createMembersCount, hapticFeedback } from '@utils'
import { useNavigate } from 'react-router-dom'

import styles from './UserChatsList.module.scss'

interface UserChatsListProps {
  chats: AdminChat[]
}

export const UserChatsList = ({ chats }: UserChatsListProps) => {
  const navigate = useNavigate()

  if (!chats.length) {
    return (
      <BlockNew className={styles.emptyContainer}>
        <StickerPlayer lottie={lockLottie} height={120} width={120} />
        <BlockNew margin="12px 0 0 0">
          <Text type="title2" color="primary" align="center" weight="bold">
            Nothing Added Yet
          </Text>
        </BlockNew>
        <BlockNew margin="8px 0 0 0">
          <Text type="text" color="secondary" align="center">
            Set up your first private access to your
            <br />
            Telegram group or channel.
          </Text>
        </BlockNew>
      </BlockNew>
    )
  }

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
            navigate(`/admin/chat/${chat.slug}`)
          }}
        />
      ))}
    </Group>
  )
}
