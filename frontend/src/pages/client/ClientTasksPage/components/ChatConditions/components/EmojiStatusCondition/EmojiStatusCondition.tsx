import { ConditionIcon, ListItem, Text, useToast } from '@components'
import { createConditionName } from '@utils'
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
        padding="4px 16px"
        height="48px"
        showCheck
        isCompleted
        before={<ConditionIcon condition={rule} />}
        text={<Text type="text">Emoji Status</Text>}
      />
    )
  }

  return (
    <ListItem
      padding="4px 16px"
      height="48px"
      showCheck
      isCompleted
      chevron={!disabled}
      onClick={handleEmojiStatus}
      before={<ConditionIcon condition={rule} />}
      text={<Text type="text">{createConditionName(rule)}</Text>}
    />
  )
}
