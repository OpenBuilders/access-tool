import { Container, Icon } from '@components'
import { useAppNavigation, useToast } from '@hooks'
import { ROUTES_NAME } from '@routes'
import commonStyles from '@styles/commonStyles.module.scss'
import { Cell, Link, Navigation, Section } from '@telegram-apps/telegram-ui'
import cn from 'classnames'

import { useChat, ChatRule, useConditionActions, useCondition } from '@store'

export const ChatConditions = () => {
  const { appNavigate } = useAppNavigation()
  const { chat, rules } = useChat()

  const { createConditionJettonAction } = useConditionActions()
  const { showToast } = useToast()

  const createCondition = async () => {
    if (!chat?.slug) return
    try {
      const condition = await createConditionJettonAction(chat?.slug)

      appNavigate({
        path: ROUTES_NAME.CHAT_NEW_CONDITION,
        params: {
          chatSlug: chat?.slug,
        },
      })
    } catch (error) {
      console.error(error)
      showToast({
        description: 'Failed to create condition',
        icon: 'error',
      })
    }
  }

  const navigateToConditionPage = (rule: ChatRule) => {
    appNavigate({
      path: ROUTES_NAME.CHAT_CONDITION,
      params: { conditionId: rule.id, chatSlug: chat?.slug },
    })
  }

  return (
    <Container className={cn(commonStyles.mt8, commonStyles.mb24)}>
      <Section header="Who can Join">
        {rules?.map((rule) => (
          <Cell
            Component={Navigation}
            key={`${rule.id}_${rule.title}`}
            onClick={() => navigateToConditionPage(rule)}
          >
            {rule.title}
          </Cell>
        ))}
        <Cell
          Component={Link}
          before={<Icon name="plus" size={28} />}
          onClick={createCondition}
        >
          Add Condition
        </Cell>
      </Section>
    </Container>
  )
}
