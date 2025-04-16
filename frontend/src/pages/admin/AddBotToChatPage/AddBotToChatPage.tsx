import {
  Block,
  Icon,
  PageLayout,
  TelegramBackButton,
  TelegramMainButton,
  Text,
} from '@components'
import { useAppNavigation, useInterval } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { useCallback, useEffect, useState } from 'react'

import config from '@config'
import { AdminChat, useChatActions } from '@store'

import { findNewChat } from './helpers'

const webApp = window.Telegram.WebApp

export const AddBotToChatPage = () => {
  const { appNavigate } = useAppNavigation()

  const { fetchAdminUserChatsAction } = useChatActions()

  const [currentChats, setCurrentChats] = useState<AdminChat[]>([])
  const [isCheckingChats, setIsCheckingChats] = useState(false)

  const navigateToMainPage = useCallback(() => {
    appNavigate({ path: ROUTES_NAME.MAIN })
  }, [appNavigate])

  const addGatewayBot = useCallback(() => {
    webApp.openTelegramLink(
      `${config.botLink}?startgroup=&admin=restrict_members+invite_users`
    )
    setIsCheckingChats(true)
  }, [])

  const poollingChats = async () => {
    try {
      const data = await fetchAdminUserChatsAction()
      const noNewChats = data?.length === currentChats?.length
      if (noNewChats) return

      const newChat = findNewChat(data, currentChats, 'slug')

      if (newChat.length) {
        setIsCheckingChats(false)
        appNavigate({
          path: ROUTES_NAME.CHECKING_BOT_ADDED,
          params: { chatSlug: newChat[0].slug },
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchAdminUserChats = async () => {
    try {
      const data = await fetchAdminUserChatsAction()
      setCurrentChats(data)
    } catch (error) {
      console.error(error)
    }
  }

  useInterval(
    () => {
      poollingChats()
    },
    1500,
    {
      enabled: isCheckingChats,
      immediate: false,
    }
  )

  useEffect(() => {
    fetchAdminUserChats()
  }, [])

  return (
    <PageLayout center>
      <TelegramBackButton onClick={navigateToMainPage} />
      <TelegramMainButton text="Add Group or Channel" onClick={addGatewayBot} />
      <Icon name="gatewayBot" size={112} />
      <Block margin="top" marginValue={16}>
        <Text type="title" align="center" weight="bold">
          Add Gateway Bot to The Group or Channel
        </Text>
      </Block>
      <Block margin="top" marginValue={12}>
        <Text align="center" type="text">
          Gateway bot require admin access to control who can join the group or
          channel.Telegram bots can’t read messages inside the group chat.
        </Text>
      </Block>
    </PageLayout>
  )
}
