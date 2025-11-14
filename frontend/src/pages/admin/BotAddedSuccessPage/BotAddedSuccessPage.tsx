import confettiLottie from '@assets/confetti.json'
import {
  Block,
  PageLayout,
  StickerPlayer,
  TelegramBackButton,
  TelegramMainButton,
  Text,
} from '@components'
import { useAppNavigation, useError } from '@hooks'
import { ROUTES_NAME } from '@routes'
import '@styles/index.scss'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useChatActions, useApp, useAppActions } from '@store'

const webApp = window.Telegram?.WebApp

export const BotAddedSuccessPage = () => {
  const { chatSlug } = useParams<{ chatSlug: string }>()
  const { appNavigate } = useAppNavigation()
  const { fetchChatAction } = useChatActions()
  const { adminChatNotFound } = useError()

  const { isLoading } = useApp()
  const { toggleIsLoadingAction } = useAppActions()

  const fetchChat = async () => {
    if (!chatSlug) return
    try {
      await fetchChatAction(chatSlug)
      webApp?.HapticFeedback.notificationOccurred('success')
    } catch (error) {
      console.error(error)
      adminChatNotFound()
    }
  }

  useEffect(() => {
    toggleIsLoadingAction(true)
    fetchChat()
    toggleIsLoadingAction(false)
  }, [chatSlug])

  const navigateToMainPage = () => {
    appNavigate({ path: ROUTES_NAME.MAIN })
  }

  const navigateToChat = () => {
    appNavigate({
      path: ROUTES_NAME.CHAT,
      params: { chatSlug: chatSlug },
    })
  }

  if (isLoading) return null

  return (
    <PageLayout center>
      <TelegramBackButton onClick={navigateToMainPage} />
      <TelegramMainButton text="Next" onClick={navigateToChat} />
      <StickerPlayer lottie={confettiLottie} />
      <Block margin="top" marginValue={16}>
        <Text type="title" align="center" weight="bold">
          Added.
          <br />
          Now, Configure It!
        </Text>
      </Block>
      <Block margin="top" marginValue={12}>
        <Text type="text" align="center">
          Great! Your group is now connected to Access. Now it's time to set
          access conditions.
        </Text>
      </Block>
    </PageLayout>
  )
}
