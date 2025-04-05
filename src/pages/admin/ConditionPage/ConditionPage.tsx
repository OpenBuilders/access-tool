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
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import styles from './ConditionPage.module.scss'
import { Jettons } from './components'

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
  const { conditionId } = useParams<{ conditionId: string }>()

  const isNewCondition = !conditionId

  // let ConditionComponent = null

  // if (condition) {
  //   ConditionComponent = COMPONENTS[condition as keyof typeof COMPONENTS]
  // }

  return (
    <PageLayout>
      <TelegramBackButton
        onClick={() => appNavigate({ path: ROUTES_NAME.CHAT })}
      />
      <TelegramMainButton />
      <Title level="1" weight="1" plain className={styles.title}>
        Add condition
      </Title>
      <Container>
        <Jettons />
      </Container>
      {/* {ConditionComponent && (
        <Container margin="24-0-0">
          <ConditionComponent />
        </Container>
      )} */}
    </PageLayout>
  )
}
