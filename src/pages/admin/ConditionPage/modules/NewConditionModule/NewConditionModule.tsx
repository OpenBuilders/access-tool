import {
  AppSelect,
  Container,
  TelegramBackButton,
  TelegramMainButton,
  PageLayout,
} from '@components'
import { useAppNavigation, useConditionData } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { Cell, Section, Title } from '@telegram-apps/telegram-ui'
import { useParams } from 'react-router-dom'

import { useCondition } from '@store'

import styles from '../../ConditionPage.module.scss'
import { CONDITION_TYPES } from '../../constants'

export const NewConditionModule = () => {
  const { appNavigate } = useAppNavigation()
  const params = useParams<{
    conditionId: string
    chatSlug: string
    conditionType: string
  }>()
  const chatSlugParam = params.chatSlug

  const { isValid } = useCondition()

  const { ConditionComponent, createConditionMethod, initialState } =
    useConditionData(true)

  if (!ConditionComponent) return null

  return (
    <PageLayout>
      <TelegramBackButton
        onClick={() =>
          appNavigate({
            path: ROUTES_NAME.CHAT,
            params: {
              chatSlug: chatSlugParam,
            },
          })
        }
      />
      <TelegramMainButton
        text="Create Condition"
        disabled={!isValid}
        onClick={createConditionMethod}
      />
      <Title level="1" weight="1" plain className={styles.title}>
        Add condition
      </Title>
      <Container>
        <Section>
          <Cell
            after={
              <AppSelect
                onChange={(value) =>
                  appNavigate({
                    path: ROUTES_NAME.CHAT_NEW_CONDITION,
                    queryParams: { conditionType: value },
                  })
                }
                options={CONDITION_TYPES}
                value={initialState.type}
              />
            }
          >
            Choose type
          </Cell>
        </Section>
        {ConditionComponent && <ConditionComponent isNewCondition />}
      </Container>
    </PageLayout>
  )
}
