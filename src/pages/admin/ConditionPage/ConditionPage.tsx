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
import { useLocation, useParams } from 'react-router-dom'

import {
  INITIAL_CONDITION_JETTON,
  INITIAL_CONDITION_NFT_COLLECTION,
  useConditionActions,
} from '@store'

import styles from './ConditionPage.module.scss'
import { Jettons, NFT } from './components'
import { CONDITION_TYPES } from './constants'
import { ConditionModule, NewConditionModule } from './modules'

export const ConditionPage = () => {
  const { pathname } = useLocation()

  const isNewCondition = pathname.includes('new-condition')

  if (isNewCondition) return <NewConditionModule />

  return <ConditionModule />
  // const { appNavigate } = useAppNavigation()
  // const params = useParams<{
  //   conditionId: string
  //   chatSlug: string
  //   conditionType: string
  // }>()

  // const conditonTypeParam = params.conditionType
  // const chatSlugParam = params.chatSlug
  // const conditionIdParam = params.conditionId

  // const {
  //   createConditionJettonAction,
  //   setInitialConditionAction,
  //   createConditionNFTCollectionAction,
  //   fetchConditionJettonAction,
  // } = useConditionActions()

  // const currentConditionType = new URLSearchParams(window.location.search).get(
  //   'conditionType'
  // )

  // const isNewCondition = !conditionIdParam

  // const CONDITIONS = {
  //   jettons: {
  //     Component: Jettons,
  //     onCreate: () => createConditionJettonAction,
  //     initialState: INITIAL_CONDITION_JETTON,
  //   },
  //   'nft-collections': {
  //     Component: NFT,
  //     onCreate: () => createConditionNFTCollectionAction,
  //     initialState: INITIAL_CONDITION_NFT_COLLECTION,
  //   },
  // }

  // const fetchConditionJetton = async () => {
  //   if (!chatSlugParam || !conditionIdParam) return
  //   try {
  //     await fetchConditionJettonAction(chatSlugParam, conditionIdParam)
  //   } catch (error) {
  //     console.error(error)
  //   }
  // }

  // useEffect(() => {
  //   if (isNewCondition && currentConditionType) {
  //     const { initialState } =
  //       CONDITIONS[currentConditionType as keyof typeof CONDITIONS]
  //     setInitialConditionAction(initialState)
  //     appNavigate({
  //       path: ROUTES_NAME.CHAT_NEW_CONDITION,
  //       params: { chatSlug: chatSlugParam },
  //       queryParams: { currentConditionType },
  //     })
  //   }
  // }, [currentConditionType])

  // useEffect(() => {
  //   if (!conditonTypeParam) return
  //   fetchConditionJetton()
  // }, [conditonTypeParam])

  // if (!currentConditionType) return null

  // const ConditionComponent =
  //   CONDITIONS[currentConditionType as keyof typeof CONDITIONS]?.Component ||
  //   null

  // const ConditionAction =
  //   CONDITIONS[currentConditionType as keyof typeof CONDITIONS]?.onCreate ||
  //   (() => {})

  // return (
  //   <PageLayout>
  //     <TelegramBackButton
  //       onClick={() => appNavigate({ path: ROUTES_NAME.CHAT })}
  //     />
  //     <TelegramMainButton hidden={!isNewCondition} onClick={ConditionAction} />
  //     <Title level="1" weight="1" plain className={styles.title}>
  //       {isNewCondition ? 'Add condition' : 'Edit condition'}
  //     </Title>
  //     <Container>
  //       <Section>
  //         <Cell
  //           after={
  //             <AppSelect
  //               onChange={(value) =>
  //                 appNavigate({
  //                   path: ROUTES_NAME.CHAT_NEW_CONDITION,
  //                   queryParams: { currentConditionType: value },
  //                 })
  //               }
  //               options={CONDITION_TYPES}
  //               value={currentConditionType}
  //               disabled={!isNewCondition}
  //             />
  //           }
  //         >
  //           Choose type
  //         </Cell>
  //       </Section>
  //       {ConditionComponent && <ConditionComponent />}
  //     </Container>
  //   </PageLayout>
  // )
}
