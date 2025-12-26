import {
  Block,
  Group,
  Icon,
  ListItem,
  ListToggler,
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
import { ChatConditions, ChatFullControlModal, ChatHeader, ChatVisibilityModal } from './components'

export const ChatPage = () => {
  const { chatSlug } = useParams<{ chatSlug: string }>()
  const { appNavigate } = useAppNavigation()

  const { isLoading } = useApp()
  const { toggleIsLoadingAction } = useAppActions()
  const [updateChatVisibilityLoading, setUpdateChatVisibilityLoading] =
    useState(false)
  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false)

  const [isFullControlModalOpen, setIsFullControlModalOpen] = useState(false)
  const [isEnablingFullControl, setIsEnablingFullControl] = useState(false)

  const { adminChatNotFound } = useError()

  const { chat } = useChat()
  const {
    fetchChatAction,
    updateChatVisibilityAction,
    resetChatAction,
    updateChatFullControlAction,
  } = useChatActions()

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
      setIsVisibilityModalOpen(false)
      await updateChatVisibilityAction(chatSlug, {
        isEnabled: !chat?.isEnabled,
      })
      showToast({
        message: 'Chat visibility updated',
        type: 'success',
      })
    } catch (error) {
      console.error(error)
      showToast({
        message:
          error instanceof Error ? error.message : 'Something went wrong',
        type: 'error',
      })
    } finally {
      setUpdateChatVisibilityLoading(false)
    }
  }

  const handleFullControlToggle = async () => {
    if (chat?.insufficientPrivileges) return

    if (chat?.isFullControl) {
      // Is currently ON, so we are turning it OFF
      setIsEnablingFullControl(false)
      setIsFullControlModalOpen(true)
    } else {
      // Is currently OFF, so we are turning it ON
      setIsEnablingFullControl(true)
      setIsFullControlModalOpen(true)
    }
  }

  const onConfirmFullControl = async (days: number) => {
    if (!chatSlug) return
    try {
      toggleIsLoadingAction(true)
      await updateChatFullControlAction(chatSlug, {
        isEnabled: isEnablingFullControl,
        effectiveInDays: days,
      })
      showToast({
        message: 'Chat control updated',
        type: 'success',
      })
    } catch (error) {
      console.error(error)
      showToast({
        message:
          error instanceof Error ? error.message : 'Something went wrong',
        type: 'error',
      })
    } finally {
      toggleIsLoadingAction(false)
      setIsFullControlModalOpen(false)
    }
  }

  useEffect(() => {
    toggleIsLoadingAction(true)
    fetchChat()
    toggleIsLoadingAction(false)
  }, [chatSlug])

  if (isLoading) {
    return (
      <PageLayout>
        <TelegramBackButton
          onClick={() => appNavigate({ path: ROUTES_NAME.MAIN })}
        />
        <Skeleton />
      </PageLayout>
    )
  }

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
      <TelegramMainButton text="View Page" onClick={handleOpenGroupChat} />
      <ChatHeader />
      <ChatConditions />
      <Block margin="top" marginValue={24}>
        <Block margin="bottom" marginValue={44}>
          <Group header="CONFIGURATION">
            <ListItem
              padding="6px 16px"
              disabled={updateChatVisibilityLoading}
              text={
                <Text type="text" color={chat?.isEnabled ? 'danger' : 'accent'}>
                  {chat?.isEnabled
                    ? `Pause Access for New Users`
                    : 'Allow Access for New Users'}
                </Text>
              }
              after={updateChatVisibilityLoading && <Spinner size={16} />}
              onClick={() => setIsVisibilityModalOpen(true)}
              before={
                <Icon
                  name={chat?.isEnabled ? 'eyeCrossed' : 'eye'}
                  size={28}
                  color={chat?.isEnabled ? 'danger' : 'accent'}
                />
              }
            />
            <ListItem
              padding="6px 16px"
              disabled={chat?.insufficientPrivileges}
              text={
                <Block row align="center" gap={8}>
                  <Text type="text">Full Chat Management</Text>
                  <div
                    style={{
                      backgroundColor: 'var(--tg-theme-button-color, #2481cc)',
                      color: 'var(--tg-theme-button-text-color, #ffffff)',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      width: 'auto',
                      whiteSpace: 'nowrap',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      lineHeight: '1',
                    }}
                  >
                    Beta
                  </div>
                </Block>
              }
              onClick={handleFullControlToggle}
              after={
                <ListToggler
                  isEnabled={!!chat?.isFullControl}
                  onChange={handleFullControlToggle}
                  disabled={chat?.insufficientPrivileges}
                />
              }
              before={<Icon name="lock" size={28} color="accent" />}
            />
          </Group>
        </Block>
      </Block>
      <Block margin="top" marginValue="auto">
        <Text type="caption" align="center" color="tertiary">
          To delete access page to {chat?.title},
          <br />
          remove @{config.botName} from admins
        </Text>
      </Block>
      <ChatFullControlModal
        isOpen={isFullControlModalOpen}
        onClose={() => setIsFullControlModalOpen(false)}
        onConfirm={onConfirmFullControl}
        isEnabling={isEnablingFullControl}
      />
      <ChatVisibilityModal
        isOpen={isVisibilityModalOpen}
        onClose={() => setIsVisibilityModalOpen(false)}
        onConfirm={updateChatVisibility}
        isEnabled={!!chat?.isEnabled}
      />
    </PageLayout>
  )
}
