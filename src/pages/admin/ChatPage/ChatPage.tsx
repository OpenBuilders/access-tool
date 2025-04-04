import commonStyles from '@common/styles/commonStyles.module.scss'
import {
  Container,
  PageLayout,
  TelegramBackButton,
  TelegramMainButton,
} from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useChatActions } from '@store'

import { ChannelActions, ChannelConditions, ChannelHeader } from './components'

export const ChatPage = () => {
  const { channelSlug } = useParams<{ channelSlug: string }>()
  const { appNavigate } = useAppNavigation()
  const [isRedirect, setIsRedirect] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { fetchChatAction } = useChatActions()

  const fetchChat = async () => {
    if (!channelSlug) return
    try {
      await fetchChatAction(channelSlug)
    } catch (error) {
      console.error(error)
      setIsRedirect(true)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    fetchChat()
    setIsLoading(false)
  }, [channelSlug])

  useEffect(() => {
    if (isRedirect) {
      appNavigate({ path: ROUTES_NAME.MAIN })
    }
  }, [isRedirect])

  if (isLoading) return null

  return (
    <PageLayout>
      <TelegramBackButton
        onClick={() => appNavigate({ path: ROUTES_NAME.MAIN })}
      />
      <TelegramMainButton
        onClick={() => appNavigate({ path: ROUTES_NAME.MAIN })}
      />
      <ChannelHeader />
      <Container className={commonStyles.mt8}>
        <ChannelConditions />
      </Container>
      <Container className={commonStyles.mt24}>
        <ChannelActions />
      </Container>
    </PageLayout>
  )
}
