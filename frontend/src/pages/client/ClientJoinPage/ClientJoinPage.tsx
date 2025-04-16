import confettiLottie from '@assets/confetti.json'
import {
  Block,
  Image,
  PageLayout,
  Sheet,
  StickerPlayer,
  TelegramBackButton,
  TelegramMainButton,
  Text,
} from '@components'
import { goTo } from '@utils'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useChat, useChatActions } from '@store'

const webApp = window.Telegram.WebApp

export const ClientJoinPage = () => {
  const params = useParams<{ clientChatSlug: string }>()
  const clientChatSlug = params.clientChatSlug || ''

  const [isSheetOpened, setIsSheetOpened] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const { chat } = useChat()
  const { fetchUserChatAction } = useChatActions()

  const fetchUserChat = async () => {
    if (!clientChatSlug) return
    try {
      await fetchUserChatAction(clientChatSlug)
      setTimeout(() => {
        setIsSheetOpened(true)
      }, 2000)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserChat()
  }, [clientChatSlug])

  if (isLoading || !chat) return null

  const navigateToChat = () => {
    goTo(chat.joinUrl)
  }

  const handleJoinGroup = () => {
    if (isSheetOpened) {
      navigateToChat()
      webApp.close()
      return
    }

    setIsSheetOpened(true)
  }

  return (
    <PageLayout center>
      <TelegramBackButton />
      <TelegramMainButton text="Join Group" onClick={handleJoinGroup} />
      <StickerPlayer lottie={confettiLottie} />
      <Block margin="top" marginValue={8}>
        <Text type="title1" align="center" weight="bold">
          Welcome to
          <br />
          {chat.title}
        </Text>
      </Block>
      <Block margin="top" marginValue={8}>
        <Text type="text" align="center" color="tertiary">
          {chat.description}
        </Text>
      </Block>
      <Sheet opened={isSheetOpened} onClose={() => setIsSheetOpened(false)}>
        <Image src={chat?.logoPath} borderRadius={50} size={112} />
        <Block margin="top" marginValue={8}>
          <Text type="title1" align="center" weight="bold">
            {chat.title}
          </Text>
        </Block>
        <Block margin="top" marginValue={8}>
          <Text type="text" align="center" color="tertiary">
            {chat.description}
          </Text>
        </Block>
      </Sheet>
    </PageLayout>
  )
}
