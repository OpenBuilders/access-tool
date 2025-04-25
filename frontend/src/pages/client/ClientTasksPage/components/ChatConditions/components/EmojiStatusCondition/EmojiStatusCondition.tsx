import { Icon, ListItem, Text, useToast } from '@components'
import { useEffect, useState } from 'react'

import { LocalStorageService } from '@services'
import { ChatInstance, Condition } from '@store'

const webApp = window.Telegram.WebApp

interface EmojiStatusConditionProps {
  chat: ChatInstance | null
  rule: Condition
  disabled?: boolean
}

export const EmojiStatusCondition = ({
  chat,
  rule,
  disabled,
}: EmojiStatusConditionProps) => {
  const [emojiStatusAdded, setEmojiStatusAdded] = useState(
    !!LocalStorageService.getItem(
      `emojiStatusCompleted_${chat?.slug}_${rule?.id}`
    )
  )
  const { showToast } = useToast()
  useEffect(() => {
    const handler = () => {
      LocalStorageService.setItem(
        `emojiStatusCompleted_${chat?.slug}_${rule?.id}`,
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
    if (disabled) return

    if (!rule?.emojiId) {
      showToast({
        message: 'Emoji ID not found',
        type: 'error',
      })
      return
    }

    await webApp?.setEmojiStatus(rule?.emojiId)
  }

  if (emojiStatusAdded) {
    return (
      <ListItem
        before={<Icon name="check" size={24} />}
        text={<Text type="text">Emoji Status</Text>}
      />
    )
  }

  return (
    <ListItem
      chevron={!disabled}
      onClick={handleEmojiStatus}
      before={<Icon name="cross" size={24} />}
      text={<Text type="text">Emoji Status</Text>}
    />
  )
}
