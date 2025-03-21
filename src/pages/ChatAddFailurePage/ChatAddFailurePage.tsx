import { useAppNavigation } from '@common'
import {
  Icon,
  PageLayout,
  TelegramMainButton,
  TelegramBackButton,
} from '@components'
import { ROUTES_NAME } from '@routes'
import { Text, Title } from '@telegram-apps/telegram-ui'

import styles from './ChatAddFailurePage.module.scss'

export const ChatAddFailurePage = () => {
  const { appNavigate } = useAppNavigation()
  return (
    <PageLayout center>
      <TelegramBackButton
        onClick={() =>
          appNavigate({
            path: ROUTES_NAME.ADD_TELEGRAM_CHAT,
          })
        }
      />
      <TelegramMainButton text="Add Bot" onClick={() => {}} />
      <Icon name="lock" size={112} />
      <Title weight="1" plain level="1" className={styles.title}>
        Add Gateway bot
        <br />
        to the chat
      </Title>
      <Text className={styles.text}>
        The bot required to manage access. Add it to the chat before continuing.
        Bot doesn't read messages inside the chat.
      </Text>
    </PageLayout>
  )
}
