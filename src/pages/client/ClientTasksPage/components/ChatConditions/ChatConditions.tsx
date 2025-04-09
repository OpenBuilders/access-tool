import { Section } from '@telegram-apps/telegram-ui'

import { useChat } from '@store'

import { ChatConditionItem, WalletCondition } from './components'
import { sortConditions } from './helpers'

export const ChatConditions = () => {
  const { rules } = useChat()
  const { notAvailable, available } = sortConditions(rules)
  return (
    <Section>
      <WalletCondition />
      {available.map((condition) => (
        <ChatConditionItem key={condition.id} condition={condition} />
      ))}
    </Section>
  )
}
