import { Icon } from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import {
  Cell,
  Link,
  Navigation,
  Section,
  Text,
} from '@telegram-apps/telegram-ui'

import styles from './ChannelConditions.module.scss'

export const ChannelConditions = () => {
  const { appNavigate } = useAppNavigation()

  const createCondition = () => {
    appNavigate({ path: ROUTES_NAME.CHANNEL_CONDITION })
  }

  return (
    <Section className={styles.section} header="To Join">
      <Cell Component={Navigation}>Hold 10 PX</Cell>
      <Cell before={<Icon name="plus" size={28} />}>
        <Link onClick={createCondition}>Add Condition</Link>
      </Cell>
    </Section>
  )
}
