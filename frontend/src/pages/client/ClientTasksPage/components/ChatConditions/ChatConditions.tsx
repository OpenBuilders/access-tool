import { Block, List } from '@components'

import { Condition, useChat } from '@store'

import { checkWalletRequirements } from '../../helpers'
import { ChatConditionItem, WalletCondition } from './components'

interface ChatConditionsProps {
  conditions: Condition[]
}

export const ChatConditions = ({ conditions }: ChatConditionsProps) => {
  const { chat } = useChat()

  const renderWalletCondition = checkWalletRequirements(conditions)

  if (!conditions.length) return null

  return (
    <Block margin="top" marginValue={24}>
      <List separatorLeftGap={24}>
        {renderWalletCondition && <WalletCondition />}
        {conditions.map((condition) => (
          <ChatConditionItem
            condition={condition}
            key={condition.id}
            chat={chat}
          />
        ))}
      </List>
    </Block>
  )
}
