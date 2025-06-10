import { Block, ConditionIcon, Icon, List, ListItem, Text } from '@components'
import { useAppNavigation } from '@hooks'
import { CONDITION_TYPES } from '@pages'
import { ROUTES_NAME } from '@routes'
import { createConditionDescription, createConditionName } from '@utils'

import { useChat, Condition } from '@store'

import styles from './ChatConditions.module.scss'

export const ChatConditions = () => {
  const { appNavigate } = useAppNavigation()
  const { chat, rules } = useChat()

  const createCondition = async () => {
    if (!chat?.slug) return
    appNavigate({
      path: ROUTES_NAME.CHAT_NEW_CONDITION,
      params: {
        chatSlug: chat?.slug,
        conditionType: CONDITION_TYPES[0].value,
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

  return (
    <Block margin="top" marginValue={24}>
      <List header="Joining Requirements" separatorLeftGap={40}>
        {rules?.map((rule) => (
          <ListItem
            padding="4px 16px"
            height="48px"
            before={<ConditionIcon condition={rule} />}
            key={`${rule.id}-${rule.type}`}
            chevron
            text={
              <Text type="text" color="primary">
                {createConditionName(rule)}
              </Text>
            }
            description={
              <Text type="caption2" color="tertiary">
                {createConditionDescription(rule)}
              </Text>
            }
            onClick={() => navigateToConditionPage(rule)}
          />
        ))}
        <ListItem
          padding="4px 16px"
          height="48px"
          text={
            <Text type="text" color="accent">
              Add Condition
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
  )
}
