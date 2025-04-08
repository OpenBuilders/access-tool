import {
  AppSelect,
  Container,
  TelegramMainButton,
  TelegramBackButton,
  PageLayout,
  Icon,
  DialogModal,
} from '@components'
import { useAppNavigation, useConditionData } from '@hooks'
import { ROUTES_NAME } from '@routes'
import cs from '@styles/commonStyles.module.scss'
import { Cell, Section, Title } from '@telegram-apps/telegram-ui'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useCondition } from '@store'

import styles from '../../ConditionPage.module.scss'
import { CONDITION_TYPES } from '../../constants'

export const ConditionModule = () => {
  const { appNavigate } = useAppNavigation()
  const params = useParams<{
    chatSlug: string
    conditionId: string
    conditionType: string
  }>()
  const chatSlugParam = params.chatSlug
  const conditionIdParam = params.conditionId
  const conditionTypeParam = params.conditionType

  const {
    fetchConditionMethod,
    deleteConditionMethod,
    updateConditionMethod,
    ConditionComponent,
  } = useConditionData()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { condition } = useCondition()

  const handleOpenDialog = () => setIsDialogOpen(true)

  useEffect(() => {
    if (!conditionIdParam) return
    fetchConditionMethod()
  }, [conditionIdParam, fetchConditionMethod])

  if (!ConditionComponent || !condition) return null

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
      <TelegramMainButton hidden />
      <Title level="1" weight="1" plain className={styles.title}>
        Edit condition
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
                value={condition?.category}
                disabled
              />
            }
          >
            Condition type
          </Cell>
        </Section>
        {ConditionComponent && <ConditionComponent />}
        <Section className={cs.mt24}>
          <Cell
            className={cs.colorDanger}
            before={<Icon name="trash" size={24} />}
            onClick={handleOpenDialog}
          >
            Remove Condition
          </Cell>
        </Section>
      </Container>
      <DialogModal
        active={isDialogOpen}
        title="Remove Condition?"
        description="Removing this condition will delete all created dependencies. Are you sure you want to remove?"
        confirmText="Remove"
        closeText="Cancel"
        onClose={() => setIsDialogOpen(false)}
        onDelete={deleteConditionMethod}
      />
    </PageLayout>
  )
}
