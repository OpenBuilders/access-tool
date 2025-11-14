import {
  Block,
  ConfettiAnimation,
  Image,
  PageLayout,
  TelegramBackButton,
  TelegramMainButton,
  Text,
} from '@components'
import { useError } from '@hooks'
import { createMembersCount, goTo } from '@utils'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useChat, useChatActions } from '@store'

const webApp = window.Telegram?.WebApp

export const ClientJoinPage = () => {
  const params = useParams<{ clientChatSlug: string }>()
  const clientChatSlug = params.clientChatSlug || ''
  const [canJoinChat, setCanJoinChat] = useState(false)
  const { notFound } = useError()

  const [isLoading, setIsLoading] = useState(true)

  const { chat } = useChat()
  const { fetchUserChatAction } = useChatActions()

  const fetchUserChat = async () => {
    if (!clientChatSlug) return
    try {
      await fetchUserChatAction(clientChatSlug)
      webApp?.HapticFeedback.notificationOccurred('success')
    } catch (error) {
      console.error(error)
      notFound()
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserChat()
  }, [clientChatSlug])

  useEffect(() => {
    if (chat) {
      if (chat.isEligible) {
        setCanJoinChat(true)
      } else {
        notFound()
      }
    }
  }, [chat])

  if (isLoading || !chat || !canJoinChat) return null

  const navigateToChat = () => {
    goTo(chat.joinUrl)
  }

  const handleJoinGroup = () => {
    navigateToChat()
    setTimeout(() => {
      webApp?.close()
    }, 1500)
  }

  return (
    <PageLayout center>
      <TelegramBackButton />
      <TelegramMainButton text="Join Group" onClick={handleJoinGroup} />
      <ConfettiAnimation active={true} duration={5000} />
      <Image
        size={112}
        src={chat?.logoPath}
        borderRadius={50}
        fallback={chat?.title}
      />
      {chat?.membersCount && (
        <Block margin="top" marginValue={8}>
          <Text type="text" color="tertiary" align="center">
            {createMembersCount(chat?.membersCount)}
          </Text>
        </Block>
      )}
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
    </PageLayout>
  )
}
