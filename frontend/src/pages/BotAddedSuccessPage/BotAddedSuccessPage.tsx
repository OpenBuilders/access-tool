import confettiLottie from '@assets/confetti.json'
import {
  BlockNew,
  PageLayoutNew,
  StickerPlayer,
  TelegramBackButton,
  TelegramMainButton,
  Text,
} from '@components'
import '@styles/index.scss'
import { useQueryClient } from '@tanstack/react-query'
import { hapticFeedback, TANSTACK_KEYS } from '@utils'
import { useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useChatQuery } from '@store-new'

export const BotAddedSuccessPage = () => {
  const navigate = useNavigate()
  const { chatSlug } = useParams<{ chatSlug: string }>()

  const queryClient = useQueryClient()

  const { data: chatData, isLoading: chatIsLoading } = useChatQuery(chatSlug)

  const handleBackButtonClick = useCallback(() => {
    navigate('/')
  }, [])

  const handleMainButtonClick = useCallback(() => {
    hapticFeedback('soft')
    navigate(`/admin/chat/${chatData?.slug}`)
  }, [chatData?.slug])

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: TANSTACK_KEYS.ADMIN_CHATS })
  }, [])

  if (chatIsLoading) {
    return <p>is loading...</p>
  }

  return (
    <PageLayoutNew safeContent center>
      <TelegramBackButton onClick={handleBackButtonClick} />
      <TelegramMainButton text="Next" onClick={handleMainButtonClick} />
      <StickerPlayer lottie={confettiLottie} />
      <BlockNew padding="16px 0 0 0">
        <Text type="title" align="center" weight="bold">
          Added.
          <br />
          Now, Configure It!
        </Text>
      </BlockNew>
      <BlockNew padding="12px 0 0 0">
        <Text type="text" align="center">
          Great! Your group is now connected to Access. Now it's time to set
          access conditions.
        </Text>
      </BlockNew>
    </PageLayoutNew>
  )
}
