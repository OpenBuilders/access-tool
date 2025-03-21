import { Icon, PageLayout, TelegramMainButton } from '@components'
import { Text, Title } from '@telegram-apps/telegram-ui'
import { useNavigate } from 'react-router-dom'

import styles from './ChatAddFailurePage.module.scss'

export const ChatAddFailurePage = () => {
  const navigate = useNavigate()
  return (
    <PageLayout center>
      <Icon name="lock" size={112} />
      <Title weight="1" plain level="1" className={styles.title}>
        Add Gateway bot
        <br />
        to the chat
      </Title>
      <Text className={styles.text}>
        The bot required to manage access. Add it to the chat before continuing.
        Bot doesn’t read messages inside the chat.
      </Text>
      <TelegramMainButton text="Add Bot" onClick={() => {}} />
    </PageLayout>
  )
}
