import {
  AppSelect,
  Container,
  PageLayout,
  TelegramBackButton,
  TelegramMainButton,
} from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import commonStyles from '@styles/common.module.scss'
import {
  Cell,
  Section,
  SegmentedControl,
  Select,
  Title,
} from '@telegram-apps/telegram-ui'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  INITIAL_CONDITION_JETTON,
  INITIAL_CONDITION_NFT_COLLECTION,
  useConditionActions,
} from '@store'

import styles from './ConditionPage.module.scss'
import { Jettons, NFT } from './components'
import { CONDITION_TYPES } from './constants'

// const CONDITIONS = [
//   {
//     value: 'token',
//     name: 'Token',
//   },
//   {
//     value: 'nft',
//     name: 'NFT',
//   },
//   {
//     value: 'id',
//     name: 'ID',
//   },
//   {
//     value: 'api',
//     name: 'API',
//   },
// ]

// const COMPONENTS = {
//   token: TokenCondition,
//   nft: NFTCondition,
//   id: IDCondition,
//   api: APICondition,
// }

export const ConditionPage = () => {
  const { appNavigate } = useAppNavigation()
  const { conditionId, chatSlug } = useParams<{
    conditionId: string
    chatSlug: string
  }>()

  const {
    createConditionJettonAction,
    setInitialConditionAction,
    createConditionNFTCollectionAction,
  } = useConditionActions()

  const conditionType = new URLSearchParams(window.location.search).get(
    'conditionType'
  )

  const isNewCondition = !conditionId

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
    if (isNewCondition && conditionType) {
      const { initialState } =
        CONDITIONS[conditionType as keyof typeof CONDITIONS]
      setInitialConditionAction(initialState)
      appNavigate({
        path: ROUTES_NAME.CHAT_NEW_CONDITION,
        params: { chatSlug },
        queryParams: { conditionType },
      })
    }
  }, [conditionType])

  if (!conditionType) return null

  const ConditionComponent =
    CONDITIONS[conditionType as keyof typeof CONDITIONS]?.Component || null

  const ConditionAction =
    CONDITIONS[conditionType as keyof typeof CONDITIONS]?.onCreate || (() => {})

  return (
    <PageLayout>
      <TelegramBackButton
        onClick={() => appNavigate({ path: ROUTES_NAME.CHAT })}
      />
      <TelegramMainButton onClick={ConditionAction} />
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
                value={conditionType}
              />
            }
          >
            Choose type
          </Cell>
        </Section>
        {ConditionComponent && <ConditionComponent />}
      </Container>
      {/* {ConditionComponent && (
        <Container margin="24-0-0">
          <ConditionComponent />
        </Container>
      )} */}
    </PageLayout>
  )
}
