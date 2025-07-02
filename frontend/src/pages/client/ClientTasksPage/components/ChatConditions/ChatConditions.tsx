import { Block, List } from '@components'

import { useChat } from '@store'

import { checkWalletRequirements } from '../../helpers'
import { ChatConditionItem, WalletCondition } from './components'

const SEPARATOR_LEFT_GAP = 40

export const ChatConditions = () => {
  const { chat, groups, rules } = useChat()

  const renderWallet = checkWalletRequirements(rules)

  return (
    <>
      {groups?.map((group, index) => {
        const groupTitle = index === 0 ? '' : 'Or Complete'
        return (
          <Block margin="top" marginValue={24} key={group.id}>
            <List separatorLeftGap={SEPARATOR_LEFT_GAP} header={groupTitle}>
              {group.items.map((condition) => (
                <ChatConditionItem
                  condition={condition}
                  key={`${condition.id}-${condition.type}`}
                  chat={chat}
                />
              ))}
            </List>
          </Block>
        )
      })}
      {renderWallet && <WalletCondition />}
    </>
  )

  // const renderWalletCondition = checkWalletRequirements([
  //   ...conditions.available,
  //   ...conditions.notNeeded,
  //   ...conditions.orRequired,
  // ])

  // return (
  //   <>
  //     {!!conditions.whitelist.length && (
  //       <Block margin="top" marginValue={24}>
  //         <List separatorLeftGap={SEPARATOR_LEFT_GAP}>
  //           {conditions.whitelist.map((condition) => (
  //             <ChatConditionItem
  // condition={condition}
  // key={`${condition.id}-${condition.type}`}
  // chat={chat}
  //             />
  //           ))}
  //         </List>
  //       </Block>
  //     )}
  //     {!!conditions.orRequired.length && (
  //       <Block margin="top" marginValue={24}>
  //         <List separatorLeftGap={SEPARATOR_LEFT_GAP} header="OR">
  //           {renderWalletCondition && <WalletCondition />}
  //           {conditions.orRequired.map((condition) => (
  //             <ChatConditionItem
  //               condition={condition}
  //               key={`${condition.id}-${condition.type}`}
  //               chat={chat}
  //             />
  //           ))}
  //         </List>
  //       </Block>
  //     )}
  //     {!!conditions.notNeeded.length && (
  //       <Block margin="top" marginValue={24}>
  //         <List separatorLeftGap={SEPARATOR_LEFT_GAP} header="Not needed">
  //           {renderWalletCondition && <WalletCondition />}
  //           {conditions.notNeeded.map((condition) => (
  //             <ChatConditionItem
  //               condition={condition}
  //               key={`${condition.id}-${condition.type}`}
  //               chat={chat}
  //             />
  //           ))}
  //         </List>
  //       </Block>
  //     )}
  //     {!!conditions.available.length && (
  //       <Block margin="top" marginValue={24}>
  //         <List separatorLeftGap={SEPARATOR_LEFT_GAP}>
  //           {renderWalletCondition && <WalletCondition />}
  //           {conditions.available.map((condition) => (
  //             <ChatConditionItem
  //               condition={condition}
  //               key={`${condition.id}-${condition.type}`}
  //               chat={chat}
  //             />
  //           ))}
  //         </List>
  //       </Block>
  //     )}
  //   </>
  // )
}
