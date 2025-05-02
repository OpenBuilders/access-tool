import { Block, List } from '@components'

import { useChat } from '@store'

import { checkWalletRequirements } from '../../helpers'
import { FormattedConditions } from '../../types'
import { ChatConditionItem, WalletCondition } from './components'

interface ChatConditionsProps {
  conditions: FormattedConditions
}

export const ChatConditions = ({ conditions }: ChatConditionsProps) => {
  const { chat } = useChat()

  const renderWalletCondition = checkWalletRequirements([
    ...conditions.available,
    ...conditions.notNeeded,
    ...conditions.notAvailable,
  ])

  return (
    <>
      {!!conditions.whitelist.length && (
        <Block margin="top" marginValue={24}>
          <List separatorLeftGap={24}>
            {conditions.whitelist.map((condition) => (
              <ChatConditionItem
                condition={condition}
                key={`${condition.id}-${condition.type}`}
                chat={chat}
              />
            ))}
          </List>
        </Block>
      )}
      {!!conditions.notAvailable.length && (
        <Block margin="top" marginValue={24}>
          <List separatorLeftGap={24} header="Not available">
            {conditions.notAvailable.map((condition) => (
              <ChatConditionItem
                condition={condition}
                key={`${condition.id}-${condition.type}`}
                chat={chat}
                disabled
              />
            ))}
          </List>
        </Block>
      )}
      {!!conditions.notNeeded.length && (
        <Block margin="top" marginValue={24}>
          <List separatorLeftGap={24} header="Not needed">
            {renderWalletCondition && <WalletCondition />}
            {conditions.notNeeded.map((condition) => (
              <ChatConditionItem
                condition={condition}
                key={`${condition.id}-${condition.type}`}
                chat={chat}
              />
            ))}
          </List>
        </Block>
      )}
      {!!conditions.available.length && (
        <Block margin="top" marginValue={24}>
          <List separatorLeftGap={24}>
            {renderWalletCondition && <WalletCondition />}
            {conditions.available.map((condition) => (
              <ChatConditionItem
                condition={condition}
                key={`${condition.id}-${condition.type}`}
                chat={chat}
              />
            ))}
          </List>
        </Block>
      )}
    </>
  )
}
