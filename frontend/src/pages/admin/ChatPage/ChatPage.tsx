import {
  Block,
  Icon,
  ListItem,
  PageLayout,
  Spinner,
  TelegramBackButton,
  TelegramMainButton,
  Text,
  useToast,
} from '@components'
import { useAppNavigation, useError } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import config from '@config'
import { useApp, useAppActions, useChat, useChatActions } from '@store'

import { Skeleton } from './Skeleton'
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
  const { fetchChatAction, updateChatVisibilityAction, resetChatAction } =
    useChatActions()

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

  const handleOpenGroupChat = () => {
    if (!chat?.title) return
    appNavigate({
      path: ROUTES_NAME.CLIENT_TASKS,
      params: { clientChatSlug: chat?.slug },
      state: {
        fromChat: chat?.slug,
      },
    })
  }

  const handleBackNavigation = () => {
    resetChatAction()
    appNavigate({ path: ROUTES_NAME.MAIN })
  }

  return (
    <PageLayout>
      <TelegramBackButton onClick={handleBackNavigation} />
      {isLoading ? (
        <Skeleton />
      ) : (
        <>
          <TelegramMainButton text="View Page" onClick={handleOpenGroupChat} />
          <ChatHeader />
          <ChatConditions />
          <Block margin="top" marginValue={24}>
            <Block margin="bottom" marginValue={24}>
              <ListItem
                paddingY={6}
                disabled={updateChatVisibilityLoading}
                text={
                  <Text
                    type="text"
                    color={chat?.isEnabled ? 'tertiary' : 'accent'}
                  >
                    {chat?.isEnabled
                      ? `Pause Access for New Users`
                      : 'Allow Access for New Users'}
                  </Text>
                }
                after={updateChatVisibilityLoading && <Spinner size={16} />}
                onClick={updateChatVisibility}
                before={
                  <Icon
                    name={chat?.isEnabled ? 'eyeCrossed' : 'eye'}
                    size={28}
                    color={chat?.isEnabled ? 'tertiary' : 'accent'}
                  />
                }
              />
            </Block>
          </Block>
          <Block margin="top" marginValue="auto">
            <Text type="caption" align="center" color="tertiary">
              To delete access page to {chat?.title},
              <br />
              remove @{config.botName} from admins
            </Text>
          </Block>
        </>
      )}
    </PageLayout>
  )
}
