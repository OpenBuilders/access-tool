import { Icon, ListItem, Text } from '@components'
import { createConditionName } from '@utils'
import { createConditionDescription } from '@utils'

import { ChatInstance, Condition } from '@store'

import { EmojiStatusCondition } from '../EmojiStatusCondition/EmojiStatusCondition'

interface ChatConditionItemProps {
  condition: Condition
  chat: ChatInstance | null
  disabled?: boolean
}

const webApp = window.Telegram.WebApp

export const ChatConditionItem = ({
  condition,
  chat,
  disabled,
}: ChatConditionItemProps) => {
  const { isEligible, promoteUrl, type } = condition

  const handleOpenLink = () => {
    if (!promoteUrl || disabled) return

    webApp.openLink(condition.promoteUrl)
  }

  if (type === 'whitelist') {
    if (isEligible) {
      return (
        <ListItem
          before={<Icon name="check" size={24} />}
          text={<Text type="text">{createConditionName(condition)}</Text>}
          description={
            <Text type="caption2" color="tertiary">
              You're already on the list — you can access the chat without
              completing the other requirements.
            </Text>
          }
        />
      )
    } else {
      return (
        <ListItem
          before={<Icon name="cross" size={24} color="danger" />}
          text={<Text type="text">{createConditionName(condition)}</Text>}
          description={
            <Text type="caption2" color="tertiary">
              Sorry, but you can't access the chat. Connect another account if
              you have access.
            </Text>
          }
        />
      )
    }
  }

  if (type === 'emoji') {
    return (
      <EmojiStatusCondition chat={chat} rule={condition} disabled={disabled} />
    )
  }

  if (isEligible) {
    return (
      <ListItem
        before={<Icon name="check" size={24} />}
        text={<Text type="text">{createConditionName(condition)}</Text>}
        disabled={disabled}
        description={
          <Text type="caption2" color="tertiary">
            {createConditionDescription(condition)}
          </Text>
        }
      />
    )
  }

  return (
    <ListItem
      chevron={!!promoteUrl && !disabled}
      onClick={handleOpenLink}
      before={<Icon name="cross" size={24} />}
      disabled={disabled}
      text={<Text type="text">{createConditionName(condition)}</Text>}
      description={
        <Text type="caption2" color="tertiary">
          {createConditionDescription(condition)}
        </Text>
      }
    />
  )
}
