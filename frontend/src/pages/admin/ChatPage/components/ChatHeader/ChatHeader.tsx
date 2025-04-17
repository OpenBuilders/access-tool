import {
  Block,
  Button,
  Icon,
  Image,
  List,
  ListInput,
  ListItem,
  Text,
} from '@components'
import { useClipboard } from '@hooks'
import { useState } from 'react'

import config from '@config'
import { useChat, useChatActions } from '@store'

const webApp = window.Telegram?.WebApp

export const ChatHeader = () => {
  const { chat, rules } = useChat()
  const { updateChatAction } = useChatActions()
  const [description, setDescription] = useState(chat?.description ?? '')

  const isMobile =
    webApp.platform === 'ios' ||
    webApp.platform === 'android' ||
    webApp.platform === 'android_x'

  const handleChangeDescription = (value: string) => {
    setDescription(value)
  }

  const { copy } = useClipboard()

  const handleUpdateChat = () => {
    if (!chat?.slug) return
    updateChatAction(chat?.slug, { description })
  }

  const handleShareLink = () => {
    if (!chat?.slug) return
    webApp.HapticFeedback.impactOccurred('soft')

    const url = `${config.botLink}?startapp=ch_${chat?.slug}`

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
    const url = `${config.botLink}?startapp=ch_${chat?.slug}`
    webApp.HapticFeedback.impactOccurred('soft')
    copy(url, 'Link copied!')
  }

  const showLinks = rules && rules?.length > 0

  return (
    <>
      <Image size={112} src={chat?.logoPath} borderRadius={50} />
      <Block margin="top" marginValue={12}>
        <Text type="title" align="center" weight="bold">
          {chat?.title}
        </Text>
      </Block>
      {showLinks && (
        <Block
          margin="top"
          marginValue={24}
          row
          justify="between"
          align="center"
          gap={10}
        >
          <div style={{ flex: 1 }}>
            <Button
              type="primary"
              prefix={<Icon name="share" size={24} />}
              onClick={handleShareLink}
            >
              Share
            </Button>
          </div>
          <div style={{ flex: 1 }}>
            <Button type="accent" onClick={handleCopyLink}>
              Copy Link
            </Button>
          </div>
        </Block>
      )}
      <Block margin="top" marginValue={24}>
        <List header="Description">
          <ListItem>
            <ListInput
              placeholder="Short Description"
              value={description}
              onChange={handleChangeDescription}
              onBlur={handleUpdateChat}
            />
          </ListItem>
        </List>
      </Block>
    </>
  )
}
