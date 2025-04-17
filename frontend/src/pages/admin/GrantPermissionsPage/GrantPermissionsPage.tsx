import sandwatchLottie from '@assets/sandwatch.json'
import {
  Block,
  Icon,
  PageLayout,
  StickerPlayer,
  TelegramBackButton,
  TelegramMainButton,
  Text,
} from '@components'
import { useAppNavigation, useError, useInterval } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import config from '@config'
import { useApp, useChatActions, useAppActions } from '@store'

const webApp = window.Telegram.WebApp

export const GrantPermissionsPage = () => {
  const { chatSlug } = useParams<{ chatSlug: string }>()
  const { appNavigate } = useAppNavigation()
  const { fetchChatAction } = useChatActions()
  const { adminChatNotFound } = useError()

  const { isLoading } = useApp()
  const { toggleIsLoadingAction } = useAppActions()

  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false)

  const fetchChat = async () => {
    if (!chatSlug) return
    try {
      const { chat } = await fetchChatAction(chatSlug)
      if (!chat?.insufficientPrivileges) {
        appNavigate({
          path: ROUTES_NAME.BOT_ADDED_SUCCESS,
          params: { chatSlug },
        })
      }
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

  const navigateToMainPage = () => {
    appNavigate({ path: ROUTES_NAME.MAIN })
  }

  const grantPermissions = () => {
    webApp.openTelegramLink(
      `${config.botLink}?startgroup=&admin=restrict_members+invite_users`
    )

    setIsCheckingPermissions(true)
  }

  useInterval(
    () => {
      fetchChat()
    },
    1500,
    {
      enabled: isCheckingPermissions,
      immediate: false,
    }
  )

  if (isLoading) return null

  let Component = null

  if (isCheckingPermissions) {
    Component = (
      <>
        <StickerPlayer lottie={sandwatchLottie} />
        <Block margin="top" marginValue={16}>
          <Text type="title" align="center" weight="bold">
            Checking Bot Permissions
          </Text>
        </Block>
        <Block margin="top" marginValue={12}>
          <Text type="text" align="center">
            This may take a moment — the check usually doesn't take long
          </Text>
        </Block>
      </>
    )
  } else {
    Component = (
      <>
        <Icon name="gatewayBot" size={112} />
        <Block margin="top" marginValue={16}>
          <Text type="title" align="center" weight="bold">
            Gateway Bot Has No Permissions
          </Text>
        </Block>
        <Block margin="top" marginValue={12}>
          <Text align="center" type="text">
            The bot was added but doesn't have permissions yet. Please grant
            permissions.
          </Text>
        </Block>
      </>
    )
  }

  const handleClick = () => {
    if (isCheckingPermissions) {
      setIsCheckingPermissions(false)
    } else {
      grantPermissions()
    }
  }

  return (
    <PageLayout center>
      <TelegramBackButton onClick={navigateToMainPage} />
      <TelegramMainButton
        text={isCheckingPermissions ? 'Cancel' : 'Grant Access'}
        onClick={handleClick}
      />
      {Component}
    </PageLayout>
  )
}
