import sandwatchLottie from '@assets/sandwatch.json'
import commonStyles from '@common/styles/commonStyles.module.scss'
import {
  PageLayout,
  StickerPlayer,
  TelegramBackButton,
  TelegramMainButton,
} from '@components'
import { useAppNavigation, useError, useInterval } from '@hooks'
import { ROUTES_NAME } from '@routes'
import '@styles/index.scss'
import { Title, Text } from '@telegram-apps/telegram-ui'
import cn from 'classnames'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useChat, useChatActions } from '@store'

export const CheckingBotAddedPage = () => {
  const { chatSlug } = useParams<{ chatSlug: string }>()
  const { appNavigate } = useAppNavigation()
  const { fetchChatAction } = useChatActions()
  const { pageNotFound } = useError()
  const { chat } = useChat()

  const fetchChat = async () => {
    if (!chatSlug) return
    try {
      await fetchChatAction(chatSlug)
      if (chat?.chat?.insufficientPrivileges) {
        appNavigate({
          path: ROUTES_NAME.BOT_ADDED_SUCCESS,
          params: { chatSlug },
        })
      }
    } catch (error) {
      console.error(error)
      pageNotFound('Chat not found')
    }
  }

  useInterval(
    () => {
      if (!chatSlug) return
      fetchChat()
    },
    1000,
    {
      enabled: true,
      immediate: true,
    }
  )

  return (
    <PageLayout center>
      <TelegramBackButton
        onClick={() => appNavigate({ path: ROUTES_NAME.MAIN })}
      />
      <TelegramMainButton hidden />
      <StickerPlayer lottie={sandwatchLottie} />
      <Title
        weight="1"
        plain
        level="1"
        className={cn(commonStyles.textCenter, commonStyles.mt16)}
      >
        Checking If the Bot Was
        <br />
        Added to Your Group or Channel
      </Title>
      <Text className={cn(commonStyles.textCenter, commonStyles.mt12)}>
        Gateway bot require admin access to control who can join the group or
        channel.Telegram bots can’t read messages inside the group chat.
      </Text>
    </PageLayout>
  )
}
