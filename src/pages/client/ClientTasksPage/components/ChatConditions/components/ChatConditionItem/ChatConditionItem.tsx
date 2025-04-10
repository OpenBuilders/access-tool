import { Icon, ListItem } from '@components'
import cs from '@styles/commonStyles.module.scss'
import { Cell, Navigation, Text } from '@telegram-apps/telegram-ui'

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
      <Text key={attribute.traitType}>
        {attribute.value} {attribute.traitType}
      </Text>
    ))
  }

  if (isEligible) {
    return (
      <ListItem
        before={<Icon name="check" size={20} />}
        text={<Text type="text">{title}</Text>}
        // description={renderAttributes()}
      />
    )
  }

  return (
    <ListItem
      chevron
      onClick={handleOpenLink}
      before={<Icon name="cross" size={20} />}
      text={<Text type="text">{title}</Text>}
      // description={renderAttributes()}
    />
  )
}
