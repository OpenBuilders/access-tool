import {
  Container,
  PageLayout,
  TelegramBackButton,
  TelegramMainButton,
} from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import cs from '@styles/commonStyles.module.scss'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useChat, useChatActions } from '@store'

import { ChatConditions, ChatHeader } from './components'

export const ClientTasksPage = () => {
  const { clientChatSlug } = useParams<{ clientChatSlug: string }>()
  const [isLoading, setIsLoading] = useState(true)

  const { appNavigate } = useAppNavigation()

  const { fetchUserChatAction } = useChatActions()
  const { chat, rules, chatWallet } = useChat()

  const fetchUserChat = async () => {
    if (!clientChatSlug) return
    try {
      setIsLoading(true)
      await fetchUserChatAction(clientChatSlug)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!clientChatSlug) return
    fetchUserChat()
  }, [clientChatSlug])

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
      <Container className={cs.mt24}>
        <ChatConditions />
      </Container>
    </PageLayout>
  )
}
