import { useToast } from '@common'
import { Icon } from '@components'
import { Cell, Section, Snackbar, Text } from '@telegram-apps/telegram-ui'

import styles from './ChannelActions.module.scss'

export const ChannelActions = () => {
  const { showToast } = useToast()
  const handleDelete = () => {
    console.log('delete')
    showToast({
      description: 'Message returned to the list',
    })
  }

  return (
    <Section>
      <Cell before={<Icon name="trash" size={28} />} onClick={handleDelete}>
        <Text className={styles.delete}>Remove chat</Text>
      </Cell>
    </Section>
  )
}
