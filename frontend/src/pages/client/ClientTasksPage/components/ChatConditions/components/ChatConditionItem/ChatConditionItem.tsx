import { Icon, ListItem, Text } from '@components'
import { createConditionName } from '@utils'

import { ChatInstance, Condition } from '@store'

import { EmojiStatusCondition } from '../EmojiStatusCondition/EmojiStatusCondition'

interface ChatConditionItemProps {
  condition: Condition
  chat: ChatInstance | null
}

const webApp = window.Telegram.WebApp

export const ChatConditionItem = ({
  condition,
  chat,
}: ChatConditionItemProps) => {
  const { isEligible, promoteUrl, type } = condition

  const handleOpenLink = () => {
    if (!promoteUrl) return

    webApp.openLink(condition.promoteUrl)
  }

  if (type === 'emoji') {
    return <EmojiStatusCondition chat={chat} rule={condition} />
  }

  if (isEligible) {
    return (
      <ListItem
        before={<Icon name="check" size={24} />}
        text={<Text type="text">{createConditionName(condition)}</Text>}
      />
    )
  }

  return (
    <ListItem
      chevron={!!promoteUrl}
      onClick={handleOpenLink}
      before={<Icon name="cross" size={24} />}
      text={<Text type="text">{createConditionName(condition)}</Text>}
    />
  )
}
