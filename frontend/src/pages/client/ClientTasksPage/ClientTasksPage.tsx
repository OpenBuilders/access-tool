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
      const data = await fetchUserChatAction(clientChatSlug)

      if (data?.isEligible) {
        appNavigate({
          path: ROUTES_NAME.CLIENT_JOIN,
          params: { clientChatSlug },
        })
      }
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
    if (chat?.isEligible && chat?.isMember) {
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
        loading={isLoading}
      />
      <ChatHeader />
      <Block margin="top" marginValue={24}>
        <ChatConditions />
      </Block>
    </PageLayout>
  )
}
