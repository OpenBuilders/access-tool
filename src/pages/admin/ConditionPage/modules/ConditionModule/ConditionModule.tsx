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
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import cs from '@styles/commonStyles.module.scss'
import { Cell, Section, Title } from '@telegram-apps/telegram-ui'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useCondition, useConditionActions } from '@store'

import styles from '../../ConditionPage.module.scss'
import { Jettons } from '../../components/Jettons'
import { NFT } from '../../components/NFT'
import { CONDITION_TYPES } from '../../constants'

export const ConditionModule = () => {
  const { appNavigate } = useAppNavigation()
  const params = useParams<{
    conditionId: string
    chatSlug: string
    conditionType: string
  }>()
  const conditionIdParam = params.conditionId
  const conditionTypeParam = params.conditionType
  const chatSlugParam = params.chatSlug

  const { showToast } = useToast()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { fetchConditionJettonAction, deleteConditionJettonAction } =
    useConditionActions()
  const { condition } = useCondition()

  const CONDITIONS = {
    jetton: {
      Component: Jettons,
      onDelete: deleteConditionJettonAction,
      fetchMethod: fetchConditionJettonAction,
    },
    'nft-collections': {
      Component: NFT,
      onDelete: () => {
        console.log('deleted nft')
      },
      fetchMethod: () => {},
    },
  }

  const handleOpenDialog = () => setIsDialogOpen(true)

  const deleteCondition = async () => {
    if (!chatSlugParam || !conditionIdParam) return
    try {
      const { onDelete } =
        CONDITIONS[conditionTypeParam as keyof typeof CONDITIONS]
      await onDelete(chatSlugParam, conditionIdParam)
      setIsDialogOpen(false)
      appNavigate({
        path: ROUTES_NAME.CHAT,
        params: {
          chatSlug: chatSlugParam,
        },
      })
      showToast({
        message: 'Condition removed',
        type: 'success',
      })
    } catch (error) {
      console.error(error)
      showToast({
        message: 'Failed to remove condition',
        type: 'error',
      })
    }
  }

  const fetchCondition = async () => {
    if (!chatSlugParam || !conditionIdParam) return
    try {
      const { fetchMethod } =
        CONDITIONS[conditionTypeParam as keyof typeof CONDITIONS]
      await fetchMethod(chatSlugParam, conditionIdParam)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (conditionTypeParam) {
      fetchCondition()
    }
  }, [conditionTypeParam])

  if (!conditionTypeParam || !condition) return null

  const ConditionComponent =
    CONDITIONS[conditionTypeParam as keyof typeof CONDITIONS]?.Component || null

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
                value={conditionTypeParam}
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
        onDelete={deleteCondition}
      />
    </PageLayout>
  )
}
