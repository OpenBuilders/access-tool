import { Image, BlockNew, Text, Button, ButtonNew, Icon } from '@components'
import { useClipboard } from '@hooks'
import { Chat } from '@types'
import { checkIsMobile, hapticFeedback, pluralize } from '@utils'

import config from '@config'

interface ChatHeaderProps {
  chat?: Chat
}

const webApp = window.Telegram?.WebApp

export const ChatHeader = (props: ChatHeaderProps) => {
  const { chat } = props

  if (!chat) return null

  const { isMobile } = checkIsMobile()
  const { copy } = useClipboard()

  const handleShareLink = () => {
    if (!chat?.slug) return
    hapticFeedback('soft')

    const url = `${config.miniAppLink}?startapp=ch_${chat?.slug}`

    if (isMobile) {
      webApp?.openTelegramLink(
        `https://t.me/share/url?url=${encodeURI(url)}&text=${chat.title}`
      )
    } else {
      copy(url, 'Link copied!')
    }
  }

  const handleCopyLink = () => {
    if (!chat?.slug) return
    hapticFeedback('soft')

    const url = `${config.miniAppLink}?startapp=ch_${chat?.slug}`
    copy(url, 'Link copied!')
  }

  return (
    <BlockNew justify="center" align="center">
      <Image
        src={chat.logoPath}
        size={112}
        borderRadius={50}
        fallback={chat.title}
      />
      <BlockNew padding="12px 0 0 0" justify="center" align="center" gap={6}>
        <Text type="title" weight="bold" align="center">
          {chat.title}
        </Text>
        <Text type="text" color="secondary" align="center">
          {pluralize(['member', 'members', 'members'], chat.membersCount)}
        </Text>
      </BlockNew>
      <BlockNew
        padding="24px 0 0 0"
        justify="between"
        align="center"
        row
        gap={10}
      >
        <ButtonNew
          type="primary"
          text="Share"
          icon={<Icon name="share" />}
          onClick={handleShareLink}
        />
        <ButtonNew type="secondary" text="Copy Link" onClick={handleCopyLink} />
      </BlockNew>
    </BlockNew>
  )
}
