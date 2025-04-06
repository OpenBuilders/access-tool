import {
  AppSelect,
  Container,
  TelegramMainButton,
  TelegramBackButton,
  PageLayout,
} from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { Cell, Section, Title } from '@telegram-apps/telegram-ui'
import { useEffect } from 'react'
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

  const { fetchConditionJettonAction } = useConditionActions()
  const { condition } = useCondition()

  const CONDITIONS = {
    jetton: {
      Component: Jettons,
      onDelete: () => () => {
        console.log('deleted jetton')
      },
      fetchMethod: (chatSlug: string, conditionId: string) =>
        fetchConditionJettonAction(chatSlug, conditionId),
    },
    'nft-collections': {
      Component: NFT,
      onDelete: () => () => {
        console.log('deleted nft')
      },
      fetchMethod: () => {},
    },
  }

  const fetchCondition = async () => {
    if (!chatSlugParam || !conditionIdParam) return
    console.log(conditionTypeParam)
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

  const ConditionAction =
    CONDITIONS[conditionTypeParam as keyof typeof CONDITIONS]?.onDelete ||
    (() => {})

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
      </Container>
    </PageLayout>
  )
}
