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
    ...conditions.orRequired,
  ])

  return (
    <>
      {!!conditions.whitelist.length && (
        <Block margin="top" marginValue={24}>
          <List separatorLeftGap={24} header="Whitelist">
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
      {!!conditions.externalSource.length && (
        <Block margin="top" marginValue={24}>
          <List separatorLeftGap={24} header="External Source">
            {conditions.externalSource.map((condition) => (
              <ChatConditionItem
                condition={condition}
                key={`${condition.id}-${condition.type}`}
                chat={chat}
              />
            ))}
          </List>
        </Block>
      )}
      {!!conditions.orRequired.length && (
        <Block margin="top" marginValue={24}>
          <List separatorLeftGap={24} header="OR">
            {renderWalletCondition && <WalletCondition />}
            {conditions.orRequired.map((condition) => (
              <ChatConditionItem
                condition={condition}
                key={`${condition.id}-${condition.type}`}
                chat={chat}
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
