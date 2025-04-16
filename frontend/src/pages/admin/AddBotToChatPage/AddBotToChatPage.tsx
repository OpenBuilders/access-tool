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
import { useEffect, useState } from 'react'

import config from '@config'
import { AdminChat, useChatActions } from '@store'
import { useChat } from '@store'

import { findNewChat } from './helpers'

const webApp = window.Telegram.WebApp

export const AddBotToChatPage = () => {
  const { appNavigate } = useAppNavigation()

  const { fetchAdminUserChatsAction } = useChatActions()
  const { adminChats } = useChat()

  const [currentChats, setCurrentChats] = useState<AdminChat[]>([])
  const [isCheckingChats, setIsCheckingChats] = useState(false)

  // const isMobile =
  //   webApp.platform === 'android' ||
  //   webApp.platform === 'ios' ||
  //   webApp.platform === 'android_x'

  const navigateToMainPage = () => {
    appNavigate({ path: ROUTES_NAME.MAIN })
  }

  const addGatewayBot = () => {
    webApp.openTelegramLink(
      `${config.botLink}?startgroup=&admin=restrict_members+invite_users`
    )

    setIsCheckingChats(true)
  }

  const poollingChats = async () => {
    try {
      await fetchAdminUserChatsAction()
    } catch (error) {
      console.error(error)
    }
  }

  const fetchAdminUserChats = async () => {
    try {
      await fetchAdminUserChatsAction()
    } catch (error) {
      console.error(error)
    }
  }

  useInterval(
    () => {
      poollingChats()
    },
    1000,
    {
      enabled: isCheckingChats,
      immediate: false,
    }
  )

  useEffect(() => {
    if (adminChats?.length && !isCheckingChats) {
      setCurrentChats(adminChats)
    }

    if (isCheckingChats) {
      const noNewChats = adminChats?.length === currentChats?.length
      if (!noNewChats) return

      const newChat = findNewChat(adminChats, currentChats, 'slug')

      if (newChat.length) {
        appNavigate({
          path: ROUTES_NAME.CHECKING_BOT_ADDED,
          params: { chatSlug: newChat[0].slug },
        })
        setIsCheckingChats(false)
        return
      }
    }
  }, [adminChats?.length, isCheckingChats])

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
