import {
  Container,
  PageLayout,
  TelegramBackButton,
  TelegramMainButton,
} from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { SegmentedControl, Title } from '@telegram-apps/telegram-ui'
import { SegmentedControlItem } from '@telegram-apps/telegram-ui/dist/components/Navigation/SegmentedControl/components/SegmentedControlItem/SegmentedControlItem'
import { useState } from 'react'

import styles from './NewConditionPage.module.scss'
import {
  APICondition,
  IDCondition,
  NFTCondition,
  TokenCondition,
} from './components'

const CONDITIONS = [
  {
    value: 'token',
    name: 'Token',
  },
  {
    value: 'nft',
    name: 'NFT',
  },
  {
    value: 'id',
    name: 'ID',
  },
  {
    value: 'api',
    name: 'API',
  },
]

const COMPONENTS = {
  token: TokenCondition,
  nft: NFTCondition,
  id: IDCondition,
  api: APICondition,
}

export const NewConditionPage = () => {
  const { appNavigate } = useAppNavigation()
  const [condition, setCondition] = useState('token')

  let ConditionComponent = null

  if (condition) {
    ConditionComponent = COMPONENTS[condition as keyof typeof COMPONENTS]
  }

  return (
    <PageLayout>
      <TelegramBackButton
        onClick={() => appNavigate({ path: ROUTES_NAME.CHANNEL })}
      />
      <TelegramMainButton />
      <Title level="1" weight="1" plain className={styles.title}>
        Add condition
      </Title>
      <SegmentedControl className={styles.controls}>
        {CONDITIONS.map((c) => (
          <SegmentedControlItem
            key={c.name}
            onClick={() => setCondition(c.value)}
            selected={c.value === condition}
          >
            {c.name}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
      {ConditionComponent && (
        <Container margin="24-0-0">
          <ConditionComponent />
        </Container>
      )}
    </PageLayout>
  )
}
