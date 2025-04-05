import {
  AppSelect,
  Container,
  PageLayout,
  TelegramBackButton,
  TelegramMainButton,
} from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import {
  Cell,
  Section,
  SegmentedControl,
  Select,
  Title,
} from '@telegram-apps/telegram-ui'
import { SegmentedControlItem } from '@telegram-apps/telegram-ui/dist/components/Navigation/SegmentedControl/components/SegmentedControlItem/SegmentedControlItem'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'

import styles from './ConditionPage.module.scss'

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
  const { pathname } = useLocation()
  const { appNavigate } = useAppNavigation()
  const [condition, setCondition] = useState('token')

  const isNewCondition = pathname.includes('new-condition')

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
        <Section>
          <Cell
            after={
              <AppSelect
                options={[
                  { value: 'token', label: 'Token' },
                  { value: 'nft', label: 'NFT' },
                ]}
              />
            }
          >
            Choose type
          </Cell>
        </Section>
      </Container>
      {/* {ConditionComponent && (
        <Container margin="24-0-0">
          <ConditionComponent />
        </Container>
      )} */}
    </PageLayout>
  )
}
