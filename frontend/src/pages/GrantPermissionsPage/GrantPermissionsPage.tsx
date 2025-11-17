import sandwatchLottie from '@assets/sandwatch.json'
import {
  BlockNew,
  Icon,
  PageLayout,
  StickerPlayer,
  TelegramBackButton,
  TelegramMainButton,
  Text,
} from '@components'
import { useQueryClient } from '@tanstack/react-query'
import { hapticFeedback, TANSTACK_KEYS } from '@utils'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import config from '@config'
import { useAdminChatPollingQuery } from '@store-new'

const webApp = window.Telegram?.WebApp

export const GrantPermissionsPage = () => {
  const navigate = useNavigate()
  const { chatSlug } = useParams<{ chatSlug: string }>()
  const queryClient = useQueryClient()

  const [isPolling, setIsPolling] = useState(false)

  const { isLoading: chatPollingIsLoading } = useAdminChatPollingQuery(
    chatSlug,
    isPolling
  )

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: TANSTACK_KEYS.ADMIN_CHATS })
  }, [])

  const handleClickMainButton = () => {
    hapticFeedback('soft')

    if (isPolling) {
      setIsPolling(false)
      return
    }

    webApp?.openTelegramLink(
      `${config.botLink}?startgroup=&admin=restrict_members+invite_users`
    )
    setIsPolling(true)
  }

  const handleClickBackButton = useCallback(() => {
    navigate('/')
  }, [])

  let Component = null

  if (isPolling) {
    Component = (
      <BlockNew padding="0 16px" align="center" key="polling">
        <StickerPlayer lottie={sandwatchLottie} />
        <BlockNew padding="16px 0 0 0">
          <Text type="title" align="center" weight="bold">
            Checking Bot Permissions
          </Text>
        </BlockNew>
        <BlockNew padding="12px 0 0 0">
          <Text align="center" type="text">
            This may take a moment — the check usually doesn't take long
          </Text>
        </BlockNew>
      </BlockNew>
    )
  } else {
    Component = (
      <BlockNew padding="0 16px" align="center" key="add-bot">
        <Icon name="gatewayBot" size={112} />
        <BlockNew padding="16px 0 0 0">
          <Text type="title" align="center" weight="bold">
            Access Bot Has No Permissions
          </Text>
        </BlockNew>
        <BlockNew padding="12px 0 0 0">
          <Text align="center" type="text">
            The bot was added but doesn't have permissions yet. Please grant
            permissions.
          </Text>
        </BlockNew>
      </BlockNew>
    )
  }

  return (
    <PageLayout center>
      <TelegramBackButton onClick={handleClickBackButton} />
      <TelegramMainButton
        text={isPolling ? 'Cancel' : 'Grant Access'}
        onClick={handleClickMainButton}
        disabled={chatPollingIsLoading}
        loading={chatPollingIsLoading}
      />
      {Component}
    </PageLayout>
  )
}
