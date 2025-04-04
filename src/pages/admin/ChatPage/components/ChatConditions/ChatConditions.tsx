import { Container, Icon } from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import commonStyles from '@styles/commonStyles.module.scss'
import { Cell, Link, Navigation, Section } from '@telegram-apps/telegram-ui'

import { useChat, ChatRule } from '@store'

export const ChatConditions = () => {
  const { appNavigate } = useAppNavigation()
  const { chat } = useChat()

  const createCondition = () => {
    appNavigate({
      path: ROUTES_NAME.CHAT_CONDITION,
      params: { conditionId: 1 },
    })
  }

  const navigateToConditionPage = (rule: ChatRule) => {
    appNavigate({
      path: ROUTES_NAME.CHAT_CONDITION,
      params: { conditionId: rule.id },
    })
  }

  return (
    <Container className={commonStyles.mt8}>
      <Section header="To Join">
        {chat?.rules?.map((rule) => (
          <Cell Component={Navigation} key={`${rule.id}_${rule.title}`}>
            {rule.title}
          </Cell>
        ))}
        <Cell before={<Icon name="plus" size={28} />}>
          <Link onClick={createCondition}>Add Condition</Link>
        </Cell>
      </Section>
    </Container>
  )
}
