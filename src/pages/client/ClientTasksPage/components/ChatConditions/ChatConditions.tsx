import { List, ListItem } from '@components'

import { useChat } from '@store'

import { ChatConditionItem, WalletCondition } from './components'
import { sortConditions } from './helpers'

export const ChatConditions = () => {
  const { rules } = useChat()
  const { notAvailable, available } = sortConditions(rules)
  return (
    <List>
      <WalletCondition />
      {available.map((condition) => (
        <ChatConditionItem condition={condition} key={condition.id} />
      ))}
    </List>
  )
}
