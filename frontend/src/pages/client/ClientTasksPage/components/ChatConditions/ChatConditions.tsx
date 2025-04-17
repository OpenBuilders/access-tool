import { List } from '@components'

import { useChat } from '@store'

import { ChatConditionItem, WalletCondition } from './components'
import { sortConditions } from './helpers'

export const ChatConditions = () => {
  const { rules } = useChat()
  const { available } = sortConditions(rules)
  return (
    <List separatorLeftGap={24}>
      <WalletCondition />
      {available.map((condition) => (
        <ChatConditionItem condition={condition} key={condition.id} />
      ))}
    </List>
  )
}
