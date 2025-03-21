import confettiLottie from '@assets/confetti.json'
import { PageLayout, StickerPlayer, TelegramMainButton } from '@components'
import { Text, Title } from '@telegram-apps/telegram-ui'
import { useNavigate } from 'react-router-dom'

import styles from './ChatAddSuccessPage.module.scss'

export const ChatAddSuccessPage = () => {
  const navigate = useNavigate()
  return (
    <PageLayout center>
      <StickerPlayer lottie={confettiLottie} />
      <Title weight="1" plain level="1" className={styles.title}>
        Chat Added. Configure it
      </Title>
      <Text className={styles.text}>
        Great! Your chat is now connected to Gateway. Now it’s time to set
        access conditions.
      </Text>
      <TelegramMainButton text="Set Access Conditions" onClick={() => {}} />
    </PageLayout>
  )
}
