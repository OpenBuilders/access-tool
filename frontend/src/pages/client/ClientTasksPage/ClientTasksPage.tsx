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

import { useApp, useAppActions, useChat, useChatActions } from '@store'

import { ChatConditions, ChatHeader } from './components'

export const ClientTasksPage = () => {
  const { clientChatSlug } = useParams<{ clientChatSlug: string }>()
  const { notFound } = useError()

  const { isLoading } = useApp()
  const { toggleIsLoadingAction } = useAppActions()

  const { appNavigate } = useAppNavigation()

  const { fetchUserChatAction } = useChatActions()
  const { chat, rules, chatWallet } = useChat()

  const fetchUserChat = async () => {
    if (!clientChatSlug) return
    try {
      toggleIsLoadingAction(true)
      await fetchUserChatAction(clientChatSlug)
    } catch (error) {
      console.error(error)
      notFound()
    } finally {
      toggleIsLoadingAction(false)
    }
  }

  useEffect(() => {
    if (!clientChatSlug) return
    fetchUserChat()
  }, [clientChatSlug])

  useEffect(() => {
    if (chat?.isEligible) {
      appNavigate({
        path: ROUTES_NAME.CLIENT_JOIN,
        params: { clientChatSlug },
      })
    }
  }, [chat])

  if (isLoading || !chat || !rules) return null

  const handleClick = async () => {
    if (chatWallet) {
      await fetchUserChat()
      return
    }

    appNavigate({
      path: ROUTES_NAME.CLIENT_TASKS,
      params: { clientChatSlug },
      queryParams: { connectWallet: 'true' },
    })
  }

  let buttonText = chatWallet ? 'Check Again' : 'Connect Wallet'

  if (chatWallet && isLoading) {
    buttonText = 'Checking...'
  }

  return (
    <PageLayout>
      <TelegramBackButton />
      <TelegramMainButton
        text={buttonText}
        disabled={isLoading}
        onClick={handleClick}
        isLoading={isLoading}
      />
      <ChatHeader />
      <Block margin="top" marginValue={24}>
        <ChatConditions />
      </Block>
    </PageLayout>
  )
}
