import { ConditionIcon, ListItem, Text } from '@components'
import { createConditionName, goTo } from '@utils'
import { createConditionDescription } from '@utils'

import { ChatInstance, Condition } from '@store'

import { EmojiStatusCondition } from '../EmojiStatusCondition/EmojiStatusCondition'

interface ChatConditionItemProps {
  condition: Condition
  chat: ChatInstance | null
  disabled?: boolean
}

export const ChatConditionItem = ({
  condition,
  chat,
  disabled,
}: ChatConditionItemProps) => {
  const { isEligible, promoteUrl, type } = condition

  const handleOpenLink = () => {
    if (!promoteUrl || disabled) return

    goTo(condition.promoteUrl)
  }

  if (type === 'whitelist' || type === 'external_source') {
    if (isEligible) {
      return (
        <ListItem
          showCheck
          isCompleted
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
      const text = chat?.isEligible
        ? "You're not on the list. But you completed the other requirements and can access the chat."
        : "Sorry, you're not on the list. But you can complete the other requirements to access the chat if they are available."
      return (
        <ListItem
          showCheck
          isCompleted={false}
          text={<Text type="text">{createConditionName(condition)}</Text>}
          description={
            <Text type="caption2" color="tertiary">
              {text}
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
        padding="4px 16px"
        height="48px"
        showCheck
        isCompleted
        before={<ConditionIcon condition={condition} />}
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
      padding="4px 16px"
      height="48px"
      chevron={!!promoteUrl && !disabled}
      onClick={handleOpenLink}
      showCheck
      isCompleted={false}
      before={<ConditionIcon condition={condition} />}
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
