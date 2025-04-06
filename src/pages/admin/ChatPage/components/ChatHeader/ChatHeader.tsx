import { Container, Icon } from '@components'
import { useClipboard } from '@hooks'
import commonStyles from '@styles/commonStyles.module.scss'
import {
  Avatar,
  AvatarStack,
  Button,
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

const webApp = window.Telegram?.WebApp

export const ChatHeader = () => {
  const { chat, rules } = useChat()
  const { updateChatAction } = useChatActions()
  const [description, setDescription] = useState(chat?.description ?? '')

  const isMobile =
    webApp.platform === 'ios' ||
    webApp.platform === 'android' ||
    webApp.platform === 'android_x'

  const handleChangeDescription = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value)
  }

  const { copy } = useClipboard()

  const handleUpdateChat = () => {
    if (!chat?.slug) return
    updateChatAction(chat?.slug, { description })
  }

  const handleShareLink = () => {
    if (!chat?.slug) return
    webApp.HapticFeedback.impactOccurred('soft')

    const url = `${config.botLink}/${chat?.slug}`

    if (isMobile) {
      webApp.openTelegramLink(
        `https://t.me/share/url?url=${encodeURI(url)}&text=${chat.title}`
      )
    } else {
      copy(url, 'Link copied!')
    }
  }

  const handleCopyLink = () => {
    if (!chat?.slug) return
    const url = `${config.botLink}/${chat?.slug}`
    copy(url, 'Link copied!')
  }

  const showLinks = rules && rules?.length > 0

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
      {showLinks && (
        <div className={cn(commonStyles.mt24, styles.links)}>
          <Button
            before={<Icon name="share" size={24} />}
            size="l"
            mode="filled"
            stretched
            style={{ gap: '4px' }}
            onClick={handleShareLink}
          >
            Share
          </Button>
          <Button size="l" mode="bezeled" stretched onClick={handleCopyLink}>
            Copy Link
          </Button>
        </div>
      )}
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
