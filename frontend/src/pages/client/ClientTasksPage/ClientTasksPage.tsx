import {
  Block,
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
import { useLocation, useParams } from 'react-router-dom'

import config from '@config'
import { LocalStorageService } from '@services'
import { useApp, useAppActions, useChat, useChatActions, useUser } from '@store'

import { Skeleton } from './Skeleton'
import { ChatConditions, ChatHeader } from './components'
import { checkWalletRequirements, createButtonText } from './helpers'

const webApp = window.Telegram.WebApp

export const ClientTasksPage = () => {
  const { clientChatSlug } = useParams<{ clientChatSlug: string }>()
  const { notFound } = useError()
  const location = useLocation()
  const fromChat = location.state?.fromChat

  const { isLoading } = useApp()
  const { toggleIsLoadingAction } = useAppActions()

  const [isChecking, setIsChecking] = useState(false)

  const { appNavigate } = useAppNavigation()

  const { fetchUserChatAction } = useChatActions()
  const { chat, rules, chatWallet, groups } = useChat()
  const { user } = useUser()

  const { showToast } = useToast()

  const fetchUserChat = async () => {
    if (!clientChatSlug) return

    try {
      const isEligible = await fetchUserChatAction(clientChatSlug)

      return isEligible
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
    if (chat && !chat?.isEnabled) {
      appNavigate({
        path: ROUTES_NAME.CLIENT_CHAT_HIDDEN,
        params: { clientChatSlug },
      })
      return
    }
  }, [chat])

  const handleBackNavigation = () => {
    appNavigate({ path: ROUTES_NAME.CHAT, params: { chatSlug: fromChat } })
  }

  const handleToAccessApp = () => {
    goTo(config.botLink)
  }

  if (isLoading || !chat || !rules || !groups) {
    return (
      <PageLayout>
        <Skeleton />
      </PageLayout>
    )
  }

  // const hideButton = !sortedConditions?.whitelist?.[0]?.isEligible

  const buttonAction = async () => {
    const needWalletConnection = checkWalletRequirements(rules)
    const emojiCondition = rules.find((rule) => rule.type === 'emoji')
    const whitelistCondition = rules.find((rule) => rule.type === 'whitelist')
    if (emojiCondition && !whitelistCondition) {
      const checkEmojiStatusCompleted = LocalStorageService.getItem(
        `emojiStatusCompleted_${chat?.slug}_${emojiCondition.id}`
      )
      if (!checkEmojiStatusCompleted) {
        return
      }
    }

    if (chat.isEligible) {
      appNavigate({
        path: ROUTES_NAME.CLIENT_JOIN,
        params: { clientChatSlug },
      })
      return
    }

    if (chatWallet || !needWalletConnection) {
      setIsChecking(true)
      const isEligible = await fetchUserChat()

      setTimeout(() => {
        setIsChecking(false)

        if (!isEligible) {
          showToast({
            type: 'warning',
            message: 'Complete all requirments to join',
          })
          webApp.HapticFeedback.notificationOccurred('error')
        } else {
          webApp?.HapticFeedback?.impactOccurred('soft')
        }
      }, 400)

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

  const buttonText = createButtonText({
    chatWallet,
    rules,
    isChecking,
    chat,
  })

  return (
    <PageLayout>
      <TelegramBackButton
        onClick={fromChat ? handleBackNavigation : undefined}
      />
      <TelegramMainButton
        text={buttonText}
        isVisible={!!buttonText}
        disabled={isLoading || isChecking}
        onClick={buttonAction}
        loading={isLoading || isChecking}
      />
      <ChatHeader />
      <Block margin="bottom" marginValue={16}>
        <ChatConditions />
      </Block>
      <Block margin="top" marginValue="auto">
        <Text align="center" type="caption" color="tertiary">
          Set up your own private access for your
          <br />
          chat or channel in the
          <Text
            type="caption"
            color="accent"
            as="span"
            onClick={handleToAccessApp}
          >
            {' '}
            Access App
          </Text>
        </Text>
      </Block>
    </PageLayout>
  )
}
