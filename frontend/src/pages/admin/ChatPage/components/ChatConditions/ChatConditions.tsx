import { Block, ConditionIcon, Icon, List, ListItem, Text } from '@components'
import { useAppNavigation } from '@hooks'
import { CONDITION_TYPES } from '@pages'
import { ROUTES_NAME } from '@routes'
import { createConditionDescription, createConditionName } from '@utils'

import { useChat, Condition } from '@store'

import styles from './ChatConditions.module.scss'

export const ChatConditions = () => {
  const { appNavigate } = useAppNavigation()
  const { chat, rules, groups } = useChat()

  const createCondition = async (groupId?: number) => {
    if (!chat?.slug) return
    appNavigate({
      path: ROUTES_NAME.CHAT_NEW_CONDITION,
      params: {
        chatSlug: chat?.slug,
        conditionType: CONDITION_TYPES[0].value,
      },
      state: {
        groupId: groupId || null,
      },
    })
  }

  const navigateToConditionPage = (rule: Condition) => {
    appNavigate({
      path: ROUTES_NAME.CHAT_CONDITION,
      params: {
        conditionId: rule.id,
        chatSlug: chat?.slug,
        conditionType: rule.type,
      },
    })
  }

  const noRules = !rules || rules.length === 0

  return (
    <>
      {groups?.map((group, index) => {
        const groupTitle = index === 0 ? 'Complete Tasks' : 'Or Complete'
        return (
          <Block margin="top" marginValue={24}>
            <List
              header={groupTitle}
              separatorLeftGap={40}
              key={group?.id}
              action={
                <Text
                  align="right"
                  type="caption"
                  color="accent"
                  uppercase
                  onClick={() => createCondition(group?.id)}
                >
                  Add Condition
                </Text>
              }
            >
              {group?.items?.map((rule) => {
                const conditionName = createConditionName(rule)
                const conditionDescription = createConditionDescription(rule)
                return (
                  <ListItem
                    padding="4px 16px"
                    height={conditionDescription ? '60px' : '50px'}
                    before={<ConditionIcon condition={rule} />}
                    key={`${rule.id}-${rule.type}`}
                    text={
                      <Text type="text" color="primary">
                        {conditionName}
                      </Text>
                    }
                    description={
                      <Text type="caption2" color="tertiary">
                        {conditionDescription}
                      </Text>
                    }
                    onClick={() => navigateToConditionPage(rule)}
                  />
                )
              })}
            </List>
          </Block>
        )
      })}
      <Block margin="top" marginValue={24}>
        <List separatorLeftGap={40}>
          <ListItem
            padding="4px 16px"
            height="50px"
            text={
              <Text type="text" color="accent">
                {noRules ? 'Add Condition' : 'Add New Group'}
              </Text>
            }
            onClick={createCondition}
            before={
              <div className={styles.iconContainer}>
                <Icon name="plus" size={28} />
              </div>
            }
          />
        </List>
      </Block>
    </>
    // <Block margin="top" marginValue={24}>
    //   <List header="Joining Requirements" separatorLeftGap={40}>
    //     {rules?.map((rule) => {
    // const conditionName = createConditionName(rule)
    // const conditionDescription = createConditionDescription(rule)

    // return (
    //   <ListItem
    //     padding="4px 16px"
    //     height={conditionDescription ? '60px' : '50px'}
    //     before={<ConditionIcon condition={rule} />}
    //     key={`${rule.id}-${rule.type}`}
    //     chevron
    //     text={
    //       <Text type="text" color="primary">
    //         {conditionName}
    //       </Text>
    //     }
    //     description={
    //       <Text type="caption2" color="tertiary">
    //         {conditionDescription}
    //       </Text>
    //     }
    //     onClick={() => navigateToConditionPage(rule)}
    //   />
    // )
    //     })}
    // <ListItem
    //   padding="4px 16px"
    //   height="50px"
    //   text={
    //     <Text type="text" color="accent">
    //       {noRules ? 'Add Condition' : 'Add New Group'}
    //     </Text>
    //   }
    //   onClick={() => {
    //     if (noRules) {
    //       createCondition(0)
    //     } else {
    //       const lastGroup = groups?.[groups.length - 1]?.id || 0
    //       createCondition(lastGroup + 1)
    //     }
    //   }}
    //   before={
    //     <div className={styles.iconContainer}>
    //       <Icon name="plus" size={28} />
    //     </div>
    //   }
    // />
    //   </List>
    // </Block>
  )
}
