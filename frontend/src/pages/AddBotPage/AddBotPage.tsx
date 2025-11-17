import sandwatchLottie from '@assets/sandwatch.json'
import {
  BlockNew,
  Icon,
  PageLayoutNew,
  StickerPlayer,
  TelegramBackButton,
  TelegramMainButton,
  Text,
} from '@components'
import { hapticFeedback } from '@utils'
import { useState } from 'react'

import config from '@config'
import { useAdminChatsPollingQuery } from '@store-new'

const webApp = window.Telegram?.WebApp

export const AddBotPage = () => {
  const [isPolling, setIsPolling] = useState(false)

  const { isLoading: adminChatsPollingIsLoading } =
    useAdminChatsPollingQuery(isPolling)

  const handleMainButtonClick = async () => {
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

  let Component = null

  if (isPolling) {
    Component = (
      <BlockNew padding="0 16px" align="center" key="polling">
        <StickerPlayer lottie={sandwatchLottie} />
        <BlockNew padding="16px 0 0 0">
          <Text type="title" align="center" weight="bold">
            Checking If the Bot Was Added to Your Group or Channel
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
            Add Access Bot
            <br />
            to The Group or Channel
          </Text>
        </BlockNew>
        <BlockNew padding="12px 0 0 0">
          <Text align="center" type="text">
            Access bot require admin access to control who can join the group or
            channel. Telegram bots can’t read messages inside the group chat.
          </Text>
        </BlockNew>
      </BlockNew>
    )
  }

  return (
    <PageLayoutNew center>
      <TelegramBackButton />
      <TelegramMainButton
        text={isPolling ? 'Cancel' : 'Add Group or Channel'}
        onClick={handleMainButtonClick}
        disabled={adminChatsPollingIsLoading}
        loading={adminChatsPollingIsLoading}
      />
      {Component}
    </PageLayoutNew>
  )
}
