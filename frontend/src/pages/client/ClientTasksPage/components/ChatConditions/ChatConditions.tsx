import { List } from '@components'

import { useChat } from '@store'

import { checkWalletRequirements } from '../../helpers'
import {
  ChatConditionItem,
  EmojiStatusCondition,
  WalletCondition,
} from './components'
import { sortConditions } from './helpers'

export const ChatConditions = () => {
  const { rules } = useChat()
  const { available } = sortConditions(rules)
  const renderWalletCondition = checkWalletRequirements(rules)
  const renderEmojiStatusCondition = rules?.some(
    (rule) => rule.type === 'emoji'
  )
  return (
    <List separatorLeftGap={24}>
      {renderWalletCondition && <WalletCondition />}
      {available.map((condition) => (
        <ChatConditionItem condition={condition} key={condition.id} />
      ))}
      {renderEmojiStatusCondition && <EmojiStatusCondition />}
    </List>
  )
}
