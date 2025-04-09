import confettiLottie from '@assets/confetti.json'
import {
  Container,
  PageLayout,
  Sheet,
  StickerPlayer,
  TelegramBackButton,
  TelegramMainButton,
} from '@components'
import cs from '@styles/commonStyles.module.scss'
import { Image, Text, Title } from '@telegram-apps/telegram-ui'
import { goTo } from '@utils'
import cn from 'classnames'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import config from '@config'
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
    const url = `https://t.me/${chat.slug}`
    goTo(url)
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
      <Title weight="1" plain level="1" className={cn(cs.textCenter, cs.mt16)}>
        Welcome to
        <br />
        {chat.title}
      </Title>
      <Text className={cn(cs.textCenter, cs.mt12)}>{chat.description}</Text>
      <Sheet opened={isSheetOpened} onClose={() => setIsSheetOpened(false)}>
        <Image
          src={`${config.CDN}/${chat?.logoPath}`}
          fallbackIcon={<p>😔</p>}
          size={96}
          className={cs.rounded}
        />
        <div className={cn(cs.mt12, cs.textCenter)}>
          <Title level="1" weight="1" plain>
            {chat?.title}
          </Title>
        </div>
        <div className={cn(cs.mt8, cs.textCenter)}>
          <Text>{chat?.description}</Text>
        </div>
      </Sheet>
    </PageLayout>
  )
}
