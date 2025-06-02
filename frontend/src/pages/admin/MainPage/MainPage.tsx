import lockLottie from '@assets/lock.json'
import {
  Block,
  PageLayout,
  StickerPlayer,
  TelegramBackButton,
  TelegramMainButton,
} from '@components'
import { Text } from '@components'
import { useAppNavigation, useError } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { goTo } from '@utils'
import { useCallback, useEffect } from 'react'

import { useChat, useChatActions, useApp, useAppActions } from '@store'

import { Skeleton } from './Skeleton'
import { ChannelsList } from './components'
import { EmptyList } from './components'

export const MainPage = () => {
  const { appNavigate } = useAppNavigation()
  const { fetchAdminUserChatsAction } = useChatActions()
  const { adminChats } = useChat()
  const { isLoading } = useApp()
  const { toggleIsLoadingAction } = useAppActions()

  const { notFound } = useError()

  const fetchAdminUserChats = async () => {
    try {
      await fetchAdminUserChatsAction()
    } catch (error) {
      console.error(error)
      notFound()
    }
  }

  useEffect(() => {
    toggleIsLoadingAction(true)
    fetchAdminUserChats()
    toggleIsLoadingAction(false)
  }, [])

  const handleAddChat = useCallback(() => {
    appNavigate({
      path: ROUTES_NAME.ADD_TELEGRAM_CHAT,
    })
  }, [appNavigate])

  const navigateToToolsPage = () => {
    goTo('https://tools.tg')
  }

  const isEmpty = !adminChats || !adminChats?.length

  return (
    <PageLayout center={isEmpty}>
      <TelegramBackButton />
      {isLoading ? (
        <Skeleton />
      ) : (
        <>
          <TelegramMainButton
            text="Add Group or Channel"
            onClick={handleAddChat}
          />
          <StickerPlayer lottie={lockLottie} />
          <Block margin="top" marginValue={8}>
            <Text type="title" align="center" weight="bold">
              Access to Groups
              <br />
              and Channels
            </Text>
          </Block>
          {isEmpty ? <EmptyList /> : <ChannelsList channels={adminChats} />}
          <Block
            margin="top"
            marginValue="auto"
            fixed={isEmpty ? 'bottom' : undefined}
          >
            <Text align="center" type="caption" color="tertiary">
              This is open source contributed by independent
              <br />
              developers, as part of
              <Text
                type="caption"
                color="accent"
                as="span"
                onClick={navigateToToolsPage}
              >
                {' '}
                Telegram Tools
              </Text>
            </Text>
          </Block>
        </>
      )}
    </PageLayout>
  )
}
