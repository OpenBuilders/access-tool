import { Block, Icon, List, ListItem, Text } from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'

import { useChat, ChatRule, Condition } from '@store'

export const ChatConditions = () => {
  const { appNavigate } = useAppNavigation()
  const { chat, rules } = useChat()

  const createCondition = async () => {
    if (!chat?.slug) return
    appNavigate({
      path: ROUTES_NAME.CHAT_NEW_CONDITION,
      params: {
        chatSlug: chat?.slug,
        conditionType: 'jetton',
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
    <>
      <Block margin="top" marginValue={24}>
        <List header="Who can Join">
          {rules?.map((rule) => (
            <ListItem
              key={rule.id}
              chevron
              text={rule.title}
              onClick={() => navigateToConditionPage(rule)}
            />
          ))}
        </List>
      </Block>
      <Block margin="top" marginValue={rules?.length ? 12 : 0}>
        <ListItem
          text={
            <Text type="text" color="accent">
              Add Condition
            </Text>
          }
          onClick={createCondition}
          before={<Icon name="plus" size={24} />}
        />
      </Block>
    </>
  )
}
