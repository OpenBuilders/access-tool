import { Icon } from '@components'
import { Cell, Section, Text } from '@telegram-apps/telegram-ui'

import styles from './ChannelActions.module.scss'

export const ChannelActions = () => {
  const handleDelete = () => {
    console.log('delete')
  }

  return (
    <Section>
      <Cell before={<Icon name="trash" size={28} />} onClick={handleDelete}>
        <Text className={styles.delete}>Remove chat</Text>
      </Cell>
    </Section>
  )
}
