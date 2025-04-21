import { Icon, ListItem, Text, useToast } from '@components'
import { useEffect, useState } from 'react'

import { LocalStorageService } from '@services'
import { useChat } from '@store'

const webApp = window.Telegram.WebApp

export const EmojiStatusCondition = () => {
  const { chat, rules } = useChat()

  const emojiRule = rules?.find((rule) => rule.type === 'emoji')

  const [emojiStatusAdded, setEmojiStatusAdded] = useState(false)
  const { showToast } = useToast()
  useEffect(() => {
    const handler = () => {
      LocalStorageService.setItem(
        `emojiStatusCompleted-${chat?.id}-${emojiRule?.id}`,
        'true'
      )
      setEmojiStatusAdded(true)
      showToast({
        message: 'Emoji status set',
        type: 'success',
      })
    }

    webApp.onEvent('emojiStatusSet', handler)

    return () => {
      webApp.offEvent('emojiStatusSet', handler)
    }
  }, [])

  const handleEmojiStatus = async () => {
    await webApp?.setEmojiStatus('5368324170671202286')
  }

  if (emojiStatusAdded) {
    return (
      <ListItem
        chevron
        before={<Icon name="check" size={24} />}
        text={
          <Text type="text" color="tertiary">
            Emoji Status Added
          </Text>
        }
      />
    )
  }

  return (
    <ListItem
      chevron
      onClick={handleEmojiStatus}
      before={<Icon name="cross" size={24} />}
      text={
        <Text type="text" color="tertiary">
          Set Emoji Status
        </Text>
      }
    />
  )
}
