import lockLottie from '@assets/lock.json'
import {
  PageLayout,
  StickerPlayer,
  TelegramBackButton,
  TelegramMainButton,
} from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { Title, Text } from '@telegram-apps/telegram-ui'
import { useEffect } from 'react'

import { useUserActions } from '@store'

import styles from './MainPage.module.scss'

export const MainPage = () => {
  const { appNavigate } = useAppNavigation()
  const { fetchUser } = useUserActions()

  const fetchUserA = async () => {
    try {
      await fetchUser()
    } catch (error) {
      console.error('🚀 ~ fetchUserA ~ error:', error)
    }
  }

  useEffect(() => {
    fetchUserA()
  }, [])

  return (
    <PageLayout center>
      <TelegramBackButton />
      <TelegramMainButton
        text="Add First Chat"
        onClick={() =>
          appNavigate({
            path: ROUTES_NAME.ADD_TELEGRAM_CHAT,
          })
        }
      />
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
    </PageLayout>
  )
}
