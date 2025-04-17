import {
  Block,
  Icon,
  ListItem,
  PageLayout,
  TelegramBackButton,
  TelegramMainButton,
  Text,
  useToast,
} from '@components'
import { useAppNavigation, useError } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { goTo } from '@utils'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useApp, useAppActions, useChat, useChatActions } from '@store'

import { ChatConditions, ChatHeader } from './components'

export const ChatPage = () => {
  const { chatSlug } = useParams<{ chatSlug: string }>()
  const { appNavigate } = useAppNavigation()

  const { isLoading } = useApp()
  const { toggleIsLoadingAction } = useAppActions()
  const { showToast } = useToast()

  const { adminChatNotFound } = useError()

  const { rules, chat } = useChat()
  const { fetchChatAction } = useChatActions()

  const isChatVisible = true

  const fetchChat = async () => {
    if (!chatSlug) return
    try {
      await fetchChatAction(chatSlug)
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

  if (isLoading) return null

  const showMainButton = rules && rules?.length > 0

  const handleOpenGroupChat = () => {
    if (!chat?.joinUrl) return
    goTo(chat?.joinUrl)
  }

  const handleChatVisibility = () => {
    showToast({
      message: 'Chat visibility is not available yet',
      type: 'error',
    })
  }

  return (
    <PageLayout>
      <TelegramBackButton
        onClick={() => appNavigate({ path: ROUTES_NAME.MAIN })}
      />
      <TelegramMainButton
        isVisible={!!showMainButton}
        text="Open Group Chat"
        onClick={handleOpenGroupChat}
      />
      <ChatHeader />
      <ChatConditions />
      <Block margin="top" marginValue={24}>
        <Block margin="bottom" marginValue={24}>
          <ListItem
            text={
              <Text type="text" color={isChatVisible ? 'danger' : 'accent'}>
                {isChatVisible ? 'Hide Bot From Chat' : 'Show Bot in Chat'}
              </Text>
            }
            onClick={handleChatVisibility}
            before={
              <Icon name={isChatVisible ? 'eyeCrossed' : 'eye'} size={28} />
            }
          />
        </Block>
      </Block>
      <Block margin="top" marginValue="auto">
        <Text type="caption" align="center" color="tertiary">
          To delete this page from Gateway,
          <br />
          remove @gateway_bot from admins
        </Text>
      </Block>
    </PageLayout>
  )
}
