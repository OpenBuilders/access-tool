import moneyLottie from '@assets/money.json'
import {
  PageLayout,
  StickerPlayer,
  TelegramBackButton,
  TelegramMainButton,
} from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import cs from '@styles/commonStyles.module.scss'
import { Title } from '@telegram-apps/telegram-ui'
import { toUserFriendlyAddress } from '@tonconnect/ui-react'
import { collapseAddress } from '@utils'
import cn from 'classnames'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useChat, useChatActions, useUser } from '@store'

export const ClientConnectedWalletPage = () => {
  const { clientChatSlug } = useParams<{ clientChatSlug: string }>()

  const [isLoading, setIsLoading] = useState(true)

  const { appNavigate } = useAppNavigation()

  const { user } = useUser()

  const { fetchUserChatAction } = useChatActions()
  const { chat, chatWallet } = useChat()

  const navigateToTasks = () => {
    appNavigate({
      path: ROUTES_NAME.CLIENT_TASKS,
      params: { clientChatSlug },
    })
  }

  const navigateToNewWalletPage = () => {
    if (user?.wallets && user?.wallets?.length > 1) {
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

  const fetchUserChat = async () => {
    if (!clientChatSlug) return
    try {
      setIsLoading(true)
      await fetchUserChatAction(clientChatSlug)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!clientChatSlug) return
    fetchUserChat()
  }, [clientChatSlug])

  if (isLoading || !chat || !chatWallet) return null

  const userFriendlyAddress = toUserFriendlyAddress(chatWallet)
  const collapsedAddress = collapseAddress(userFriendlyAddress, 4)

  return (
    <PageLayout center>
      <TelegramBackButton onClick={navigateToTasks} />
      <TelegramMainButton
        onClick={navigateToNewWalletPage}
        text="Connect New Wallet"
      />
      <StickerPlayer lottie={moneyLottie} />
      <Title weight="2" plain level="1" className={cn(cs.textCenter, cs.mt16)}>
        Wallet Connected
        <br />
        {collapsedAddress}
      </Title>
    </PageLayout>
  )
}
