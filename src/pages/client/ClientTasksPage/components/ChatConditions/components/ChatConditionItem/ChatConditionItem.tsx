import { Icon } from '@components'
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
      <Cell
        before={<Icon name="check" size={24} />}
        description={renderAttributes()}
      >
        <Text className={cs.colorPrimary}>{title}</Text>
      </Cell>
    )
  }

  return (
    <Navigation className={cs.pr12}>
      <Cell
        before={<Icon name="cross" size={20} />}
        description={renderAttributes()}
        className={cs.py10}
        onClick={handleOpenLink}
      >
        <Text className={cs.colorPrimary}>{title}</Text>
      </Cell>
    </Navigation>
  )
}
