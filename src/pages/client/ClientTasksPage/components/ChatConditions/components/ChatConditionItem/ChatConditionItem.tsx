import { Icon, ListItem, Text } from '@components'

import { ChatRule } from '@store'

interface ChatConditionItemProps {
  condition: ChatRule
}

const webApp = window.Telegram.WebApp

export const ChatConditionItem = ({ condition }: ChatConditionItemProps) => {
  const { title, isEligible, requiredAttributes } = condition

  const handleOpenLink = () => {
    webApp.openLink(condition.promoteUrl)
  }

  const renderAttributes = () => {
    return requiredAttributes?.map((attribute) => (
      <Text type="caption" color="tertiary" key={attribute.traitType}>
        {attribute.value} {attribute.traitType}
      </Text>
    ))
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
      chevron
      onClick={handleOpenLink}
      before={<Icon name="cross" size={20} />}
      text={<Text type="text">{title}</Text>}
      description={renderAttributes()}
    />
  )
}
