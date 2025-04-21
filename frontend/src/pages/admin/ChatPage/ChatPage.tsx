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
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useApp, useAppActions, useChat, useChatActions } from '@store'

import { ChatConditions, ChatHeader } from './components'

export const ChatPage = () => {
  const { chatSlug } = useParams<{ chatSlug: string }>()
  const { appNavigate } = useAppNavigation()

  const { isLoading } = useApp()
  const { toggleIsLoadingAction } = useAppActions()
  const [updateChatVisibilityLoading, setUpdateChatVisibilityLoading] =
    useState(false)

  const { adminChatNotFound } = useError()

  const { chat } = useChat()
  const { fetchChatAction, updateChatVisibilityAction } = useChatActions()

  const { showToast } = useToast()

  const fetchChat = async () => {
    if (!chatSlug) return
    try {
      await fetchChatAction(chatSlug)
    } catch (error) {
      console.error(error)
      adminChatNotFound()
    }
  }

  const updateChatVisibility = async () => {
    if (!chatSlug) return
    try {
      setUpdateChatVisibilityLoading(true)
      await updateChatVisibilityAction(chatSlug, {
        isEnabled: !chat?.isEnabled,
      })
    } catch (error) {
      console.error(error)
    } finally {
      setUpdateChatVisibilityLoading(false)
      showToast({
        message: 'Chat visibility updated',
        type: 'success',
      })
    }
  }

  useEffect(() => {
    toggleIsLoadingAction(true)
    fetchChat()
    toggleIsLoadingAction(false)
  }, [chatSlug])

  if (isLoading) return null

  const handleOpenGroupChat = () => {
    if (!chat?.joinUrl) return
    goTo(chat?.joinUrl)
  }

  return (
    <PageLayout>
      <TelegramBackButton
        onClick={() => appNavigate({ path: ROUTES_NAME.MAIN })}
      />
      <TelegramMainButton
        text="Open Group Chat"
        onClick={handleOpenGroupChat}
      />
      <ChatHeader />
      <ChatConditions />
      <Block margin="top" marginValue={24}>
        <Block margin="bottom" marginValue={24}>
          <ListItem
            paddingY={6}
            disabled={updateChatVisibilityLoading}
            text={
              <Text type="text" color={chat?.isEnabled ? 'danger' : 'accent'}>
                {chat?.isEnabled ? 'Hide Bot From Chat' : 'Show Bot in Chat'}
              </Text>
            }
            onClick={updateChatVisibility}
            before={
              <Icon name={chat?.isEnabled ? 'eyeCrossed' : 'eye'} size={28} />
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
