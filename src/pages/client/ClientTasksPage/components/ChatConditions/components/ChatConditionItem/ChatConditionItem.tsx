import { Icon, ListItem, Text } from '@components'

import { Condition } from '@store'

interface ChatConditionItemProps {
  condition: Condition
}

const webApp = window.Telegram.WebApp

export const ChatConditionItem = ({ condition }: ChatConditionItemProps) => {
  const { title, isEligible, promoteUrl, category, asset } = condition

  const handleOpenLink = () => {
    if (!promoteUrl) return

    webApp.openLink(condition.promoteUrl)
  }

  const renderAttributes = () => {
    return (
      <Text type="caption" color="tertiary">
        {asset} {category}
      </Text>
    )
  }

  if (isEligible) {
    return (
      <ListItem
        before={<Icon name="check" size={20} />}
        text={<Text type="text">{title}</Text>}
        description={renderAttributes()}
      />
    )
  }

  return (
    <ListItem
      chevron={!!promoteUrl}
      onClick={handleOpenLink}
      before={<Icon name="cross" size={20} />}
      text={<Text type="text">{title}</Text>}
      description={renderAttributes()}
    />
  )
}
