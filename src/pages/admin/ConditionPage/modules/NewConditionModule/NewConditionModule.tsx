import {
  AppSelect,
  Container,
  TelegramBackButton,
  TelegramMainButton,
  PageLayout,
} from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { Cell, Section, Title } from '@telegram-apps/telegram-ui'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import {
  INITIAL_CONDITION_NFT_COLLECTION,
  INITIAL_CONDITION_JETTON,
  useConditionActions,
  useCondition,
} from '@store'

import styles from '../../ConditionPage.module.scss'
import { Jettons } from '../../components/Jettons'
import { NFT } from '../../components/NFT'
import { CONDITION_TYPES } from '../../constants'

export const NewConditionModule = () => {
  const { appNavigate } = useAppNavigation()
  const params = useParams<{
    conditionId: string
    chatSlug: string
    conditionType: string
  }>()
  const chatSlugParam = params.chatSlug

  const {
    createConditionJettonAction,
    setInitialConditionAction,
    createConditionNFTCollectionAction,
  } = useConditionActions()

  const { isValid } = useCondition()

  const currentConditionType = new URLSearchParams(window.location.search).get(
    'conditionType'
  )

  const CONDITIONS = {
    jettons: {
      Component: Jettons,
      onCreate: () => createConditionJettonAction,
      initialState: INITIAL_CONDITION_JETTON,
    },
    'nft-collections': {
      Component: NFT,
      onCreate: () => createConditionNFTCollectionAction,
      initialState: INITIAL_CONDITION_NFT_COLLECTION,
    },
  }

  useEffect(() => {
    if (currentConditionType) {
      const { initialState } =
        CONDITIONS[currentConditionType as keyof typeof CONDITIONS]
      setInitialConditionAction(initialState)
      appNavigate({
        path: ROUTES_NAME.CHAT_NEW_CONDITION,
        params: { chatSlug: chatSlugParam },
        queryParams: { conditionType: currentConditionType },
      })
    }
  }, [currentConditionType])

  if (!currentConditionType) return null

  const ConditionComponent =
    CONDITIONS[currentConditionType as keyof typeof CONDITIONS]?.Component ||
    null

  const ConditionAction =
    CONDITIONS[currentConditionType as keyof typeof CONDITIONS]?.onCreate ||
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
      <TelegramMainButton disabled={!isValid} onClick={ConditionAction} />
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
                value={currentConditionType}
              />
            }
          >
            Choose type
          </Cell>
        </Section>
        {ConditionComponent && <ConditionComponent />}
      </Container>
    </PageLayout>
  )
}
