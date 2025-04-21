import {
  Block,
  PageLayout,
  TelegramBackButton,
  TelegramMainButton,
} from '@components'
import { useAppNavigation, useError } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useApp, useAppActions, useChat, useChatActions, useUser } from '@store'

import { ChatConditions, ChatHeader } from './components'
import { checkCanJoinChat, createButtonText } from './helpers'

export const ClientTasksPage = () => {
  const { clientChatSlug } = useParams<{ clientChatSlug: string }>()
  const { notFound } = useError()

  const { isLoading } = useApp()
  const { toggleIsLoadingAction } = useAppActions()

  const { appNavigate } = useAppNavigation()

  const { fetchUserChatAction } = useChatActions()
  const { chat, rules, chatWallet } = useChat()
  const { user } = useUser()

  const fetchUserChat = async () => {
    if (!clientChatSlug) return
    try {
      await fetchUserChatAction(clientChatSlug)
    } catch (error) {
      console.error(error)
      notFound()
    }
  }

  useEffect(() => {
    if (!clientChatSlug) return
    toggleIsLoadingAction(true)
    fetchUserChat()
    toggleIsLoadingAction(false)
  }, [clientChatSlug])

  useEffect(() => {
    if (chat && !chat?.isEnabled) {
      appNavigate({
        path: ROUTES_NAME.CLIENT_CHAT_HIDDEN,
        params: { clientChatSlug },
      })
      return
    }

    const canJoinChat = checkCanJoinChat(rules, chat)

    if (canJoinChat) {
      appNavigate({
        path: ROUTES_NAME.CLIENT_JOIN,
        params: { clientChatSlug },
      })
    }
  }, [chat])

  if (isLoading || !chat || !rules) return null

  const handleClick = async () => {
    if (chatWallet) {
      toggleIsLoadingAction(true)
      await fetchUserChat()
      toggleIsLoadingAction(false)
      return
    }

    if (user?.wallets.length) {
      appNavigate({
        path: ROUTES_NAME.CLIENT_WALLETS_LIST,
        params: { clientChatSlug },
      })
      return
    }

    appNavigate({
      path: ROUTES_NAME.CLIENT_TASKS,
      params: { clientChatSlug },
      queryParams: { connectWallet: 'true' },
    })
  }

  const buttonText = createButtonText(chatWallet, rules, isLoading, chat?.id)

  return (
    <PageLayout>
      <TelegramBackButton />
      <TelegramMainButton
        text={buttonText}
        disabled={isLoading}
        onClick={handleClick}
        loading={isLoading}
      />
      <ChatHeader />
      <Block margin="top" marginValue={24}>
        <ChatConditions />
      </Block>
    </PageLayout>
  )
}
