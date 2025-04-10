import sandwatchLottie from '@assets/sandwatch.json'
import commonStyles from '@common/styles/commonStyles.module.scss'
import {
  Block,
  PageLayout,
  StickerPlayer,
  TelegramBackButton,
  TelegramMainButton,
  Text,
} from '@components'
import { useAppNavigation, useError, useInterval } from '@hooks'
import { ROUTES_NAME } from '@routes'
import '@styles/index.scss'
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
      if (chat?.insufficientPrivileges) {
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

  const navigateToMainPage = () => {
    appNavigate({ path: ROUTES_NAME.MAIN })
  }

  return (
    <PageLayout center>
      <TelegramBackButton onClick={navigateToMainPage} />
      <TelegramMainButton hidden />
      <StickerPlayer lottie={sandwatchLottie} />
      <Block margin="top" marginValue={16}>
        <Text type="title" align="center" weight="bold">
          Checking If the Bot Was Added to Your Group or Channel
        </Text>
      </Block>
      <Block margin="top" marginValue={12}>
        <Text type="text" align="center">
          This may take a moment — the check usually doesn't take long
        </Text>
      </Block>
    </PageLayout>
  )
}
