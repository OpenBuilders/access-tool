import confettiLottie from '@assets/confetti.json'
import {
  PageLayout,
  StickerPlayer,
  TelegramBackButton,
  TelegramMainButton,
} from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { Text, Title } from '@telegram-apps/telegram-ui'

import styles from './ChatAddSuccessPage.module.scss'

export const ChatAddSuccessPage = () => {
  const { appNavigate } = useAppNavigation()
  return (
    <PageLayout center>
      <TelegramBackButton />
      <TelegramMainButton
        text="Set Access Conditions"
        onClick={() =>
          appNavigate({
            path: ROUTES_NAME.CHANNEL,
            params: { channelId: '1' },
          })
        }
      />
      <StickerPlayer lottie={confettiLottie} />
      <Title weight="1" plain level="1" className={styles.title}>
        Chat Added. Configure it
      </Title>
      <Text className={styles.text}>
        Great! Your chat is now connected to Gateway. Now it’s time to set
        access conditions.
      </Text>
    </PageLayout>
  )
}
