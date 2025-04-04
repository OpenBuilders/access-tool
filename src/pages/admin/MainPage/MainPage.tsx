import lockLottie from '@assets/lock.json'
import commonStyles from '@common/styles/commonStyles.module.scss'
import {
  PageLayout,
  StickerPlayer,
  TelegramBackButton,
  TelegramMainButton,
} from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { Title, Caption, Link } from '@telegram-apps/telegram-ui'
import cn from 'classnames'
import { useEffect, useState } from 'react'

import { useUser, useUserActions } from '@store'

import { ChannelsList } from './components'
import { EmptyList } from './components'

export const MainPage = () => {
  const { appNavigate } = useAppNavigation()
  const { fetchUserChatsAction } = useUserActions()
  const { userChats } = useUser()
  const [isLoading, setIsLoading] = useState(false)

  const fetchUserChats = async () => {
    try {
      await fetchUserChatsAction()
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    fetchUserChats()
    setIsLoading(false)
  }, [])

  if (isLoading) return null

  const isEmpty = !userChats || !userChats?.length

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
      <Title weight="1" plain level="1" className={commonStyles.textCenter}>
        Access to Groups
        <br />
        and Channels
      </Title>
      {isEmpty ? <EmptyList /> : <ChannelsList channels={userChats} />}
      <Caption
        className={cn(
          isEmpty ? commonStyles.fixedBottom : commonStyles.mtAuto,
          commonStyles.colorHint,
          commonStyles.textCenter
        )}
      >
        This is open source contributed by independent developers, as part of
        <Link href="https://t.me/telegram_tools"> Telegram Tools</Link>
      </Caption>
    </PageLayout>
  )
}
