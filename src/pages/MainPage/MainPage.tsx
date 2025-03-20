import lockLottie from '@assets/lock.json'
import { PageLayout, StickerPlayer, TelegramMainButton } from '@components'
import { Title, Text } from '@telegram-apps/telegram-ui'

import styles from './MainPage.module.scss'

export const MainPage = () => {
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
      <TelegramMainButton text="Add First Chat" onClick={() => {}} />
    </PageLayout>
  )
}
