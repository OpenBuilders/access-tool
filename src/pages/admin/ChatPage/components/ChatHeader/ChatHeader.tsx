import { Container } from '@components'
import commonStyles from '@styles/commonStyles.module.scss'
import {
  Avatar,
  AvatarStack,
  Image,
  Input,
  Text,
  Title,
} from '@telegram-apps/telegram-ui'
import cn from 'classnames'
import { ChangeEvent, useState } from 'react'

import config from '@config'
import { useChat, useChatActions } from '@store'

import styles from './ChatHeader.module.scss'

export const ChatHeader = () => {
  const { chat } = useChat()
  const { updateChatAction } = useChatActions()
  const [description, setDescription] = useState(chat?.description ?? '')

  const handleChangeDescription = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value)
  }

  const handleUpdateChat = () => {
    if (!chat?.slug) return
    updateChatAction(chat?.slug, { description })
  }

  return (
    <>
      <Image
        src={`${config.CDN}/${chat?.logoPath}`}
        fallbackIcon={<p>😔</p>}
        size={96}
        className={commonStyles.rounded}
      />
      <Title level="1" weight="1" plain className={commonStyles.mt12}>
        {chat?.title}
      </Title>
      <div className={cn(styles.members, commonStyles.mt12)}>
        <AvatarStack>
          {[
            <Avatar
              key="avatar-1"
              size={28}
              src="https://avatars.githubusercontent.com/u/84640980?v=4"
            />,
            <Avatar
              key="avatar-2"
              size={28}
              src="https://avatars.githubusercontent.com/u/1234567?v=4"
            />,
          ]}
        </AvatarStack>
        <Text className={commonStyles.colorHint}>24 members</Text>
      </div>
      <Container className={commonStyles.mt24}>
        <Input
          placeholder="Short Description"
          value={description}
          onChange={handleChangeDescription}
          onBlur={handleUpdateChat}
        />
      </Container>
    </>
  )
}
