import {
  Block,
  Icon,
  PageLayout,
  TelegramBackButton,
  TelegramMainButton,
  Text,
} from '@components'
import { useAppNavigation, useError } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { useEffect } from 'react'
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

  const navigateToMainPage = () => {
    appNavigate({ path: ROUTES_NAME.MAIN })
  }

  const grantPermissions = () => {
    webApp.openTelegramLink(
      `${config.botLink}?startgroup=&admin=restrict_members+invite_users`
    )
    appNavigate({ path: ROUTES_NAME.CHECKING_BOT_ADDED, params: { chatSlug } })
  }

  if (isLoading) return null

  return (
    <PageLayout center>
      <TelegramBackButton onClick={navigateToMainPage} />
      <TelegramMainButton text="Grant Access" onClick={grantPermissions} />
      <Icon name="gatewayBot" size={112} />
      <Block margin="top" marginValue={16}>
        <Text type="title" align="center" weight="bold">
          Gateway Bot Has No Permissions
        </Text>
      </Block>
      <Block margin="top" marginValue={12}>
        <Text align="center" type="text">
          The bot was added but doesn't have permissions yet. Please grant
          permissions.
        </Text>
      </Block>
    </PageLayout>
  )
}
