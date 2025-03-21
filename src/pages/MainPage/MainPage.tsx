import lockLottie from '@assets/lock.json'
import { PageLayout, StickerPlayer, TelegramMainButton } from '@components'
import { ROUTES_NAME } from '@routes'
import { Title, Text } from '@telegram-apps/telegram-ui'
import { useNavigate } from 'react-router-dom'

import styles from './MainPage.module.scss'

export const MainPage = () => {
  const navigate = useNavigate()
  return (
    <PageLayout center>
      <StickerPlayer lottie={lockLottie} />
      <Title weight="1" plain level="1" className={styles.title}>
        Manage Your Private
        <br />
        Telegram Chats
      </Title>
      <Text className={styles.text}>
        Connect your Telegram group and set up token-gated access in just a few
        clicks. Control who joins and engage with your private community.
      </Text>
      <TelegramMainButton
        text="Add First Chat"
        onClick={() => navigate(ROUTES_NAME.ADD_TELEGRAM_CHAT)}
      />
    </PageLayout>
  )
}
