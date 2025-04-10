import lockLottie from '@assets/lock.json'
import {
  Block,
  PageLayout,
  StickerPlayer,
  TelegramBackButton,
  TelegramMainButton,
} from '@components'
import { Text } from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { useEffect, useState } from 'react'

import { useChat, useChatActions } from '@store'

import { ChannelsList } from './components'
import { EmptyList } from './components'

export const MainPage = () => {
  const { appNavigate } = useAppNavigation()
  const { fetchAdminUserChatsAction } = useChatActions()
  const { adminChats } = useChat()
  const [isLoading, setIsLoading] = useState(false)

  const fetchAdminUserChats = async () => {
    try {
      await fetchAdminUserChatsAction()
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    fetchAdminUserChats()
    setIsLoading(false)
  }, [])

  if (isLoading) return null

  const isEmpty = !adminChats || !adminChats?.length

  return (
    <PageLayout center={isEmpty}>
      <TelegramBackButton />
      <TelegramMainButton
        text="Add Group or Channel"
        onClick={() =>
          appNavigate({
            path: ROUTES_NAME.ADD_TELEGRAM_CHAT,
          })
        }
      />
      <StickerPlayer lottie={lockLottie} />
      <Block margin="top" marginValue={16}>
        <Text type="title" align="center" weight="bold">
          Access to Groups
          <br />
          and Channels
        </Text>
      </Block>
      {isEmpty ? <EmptyList /> : <ChannelsList channels={adminChats} />}
      <Block fixed="bottom">
        <Text align="center" type="caption" color="tertiary">
          This is open source contributed by independent
          <br />
          developers, as part of
          <Text type="caption" color="accent" as="span">
            {' '}
            Telegram Tools
          </Text>
        </Text>
      </Block>
    </PageLayout>
  )
}
