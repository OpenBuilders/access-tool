import {
  AppSelect,
  Container,
  TelegramMainButton,
  TelegramBackButton,
  PageLayout,
  Icon,
  DialogModal,
  useToast,
} from '@components'
import { useAppNavigation, useConditionData } from '@hooks'
import { ROUTES_NAME } from '@routes'
import cs from '@styles/commonStyles.module.scss'
import { Cell, Section, Title } from '@telegram-apps/telegram-ui'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  Condition,
  ConditionType,
  useCondition,
  useConditionActions,
} from '@store'

import styles from '../../ConditionPage.module.scss'
import { CONDITION_COMPONENTS, CONDITION_TYPES } from '../../constants'

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

  const { showToast } = useToast()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { condition, isValid, isFieldChanged } = useCondition()
  const { deleteConditionAction, updateConditionAction } = useConditionActions()

  const handleOpenDialog = () => setIsDialogOpen(true)

  const navigateToChatPage = () => {
    appNavigate({
      path: ROUTES_NAME.CHAT,
      params: {
        chatSlug: chatSlugParam,
      },
    })
  }

  const Component =
    CONDITION_COMPONENTS[
      conditionTypeParam as keyof typeof CONDITION_COMPONENTS
    ]

  if (!Component) return null

  const handleDeleteCondition = async () => {
    if (!conditionIdParam || !chatSlugParam) return
    try {
      await deleteConditionAction({
        type: conditionTypeParam as ConditionType,
        chatSlug: chatSlugParam,
        conditionId: conditionIdParam,
      })
      navigateToChatPage()
    } catch (error) {
      console.error(error)
    }
  }

  const handleUpdateCondition = async () => {
    if (!conditionIdParam || !chatSlugParam) return
    try {
      await updateConditionAction({
        type: conditionTypeParam as ConditionType,
        chatSlug: chatSlugParam,
        conditionId: conditionIdParam,
        data: condition as Condition,
      })
      showToast({
        message: 'Condition updated successfully',
        type: 'success',
      })
      navigateToChatPage()
    } catch (error) {
      console.error(error)
      showToast({
        message: 'Failed to update condition',
        type: 'error',
      })
    }
  }

  return (
    <PageLayout>
      <TelegramBackButton onClick={navigateToChatPage} />
      <TelegramMainButton
        text="Save"
        disabled={!isValid || !isFieldChanged}
        onClick={handleUpdateCondition}
      />
      <Title level="1" weight="1" plain className={styles.title}>
        Edit condition
      </Title>
      <Container>
        <Section>
          <Cell
            disabled
            after={
              <AppSelect
                onChange={() => {}}
                options={CONDITION_TYPES}
                value={condition?.category}
                disabled
              />
            }
          >
            Condition type
          </Cell>
        </Section>
        {Component && <Component />}
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
        onDelete={handleDeleteCondition}
      />
    </PageLayout>
  )
}
