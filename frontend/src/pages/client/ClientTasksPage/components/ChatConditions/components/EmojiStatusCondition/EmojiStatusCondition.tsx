import { Icon, ListItem, Text, useToast } from '@components'
import { useEffect, useState } from 'react'

import { LocalStorageService } from '@services'
import { useChat } from '@store'

const webApp = window.Telegram.WebApp

export const EmojiStatusCondition = () => {
  const { chat, rules } = useChat()

  const emojiRule = rules?.find((rule) => rule.type === 'emoji')

  const [emojiStatusAdded, setEmojiStatusAdded] = useState(
    !!LocalStorageService.getItem(
      `emojiStatusCompleted_${chat?.slug}_${emojiRule?.id}`
    )
  )
  const { showToast } = useToast()
  useEffect(() => {
    const handler = () => {
      LocalStorageService.setItem(
        `emojiStatusCompleted_${chat?.slug}_${emojiRule?.id}`,
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
    if (!emojiRule?.emojiId) {
      showToast({
        message: 'Emoji ID not found',
        type: 'error',
      })
      return
    }

    await webApp?.setEmojiStatus(emojiRule?.emojiId)
  }

  if (emojiStatusAdded) {
    return (
      <ListItem
        before={<Icon name="check" size={24} />}
        text={<Text type="text">Emoji Status Added</Text>}
      />
    )
  }

  return (
    <ListItem
      chevron
      onClick={handleEmojiStatus}
      before={<Icon name="cross" size={24} />}
      text={<Text type="text">Set Emoji Status</Text>}
    />
  )
}
