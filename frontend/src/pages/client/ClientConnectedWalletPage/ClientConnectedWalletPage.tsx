import moneyLottie from '@assets/money.json'
import {
  Block,
  PageLayout,
  StickerPlayer,
  TelegramBackButton,
  TelegramMainButton,
  Text,
} from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { toUserFriendlyAddress } from '@tonconnect/ui-react'
import { collapseAddress } from '@utils'
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

  const buttonText =
    user?.wallets && user?.wallets?.length > 1
      ? 'Choose Wallet'
      : 'Connect New Wallet'

  return (
    <PageLayout center>
      <TelegramBackButton onClick={navigateToTasks} />
      <TelegramMainButton onClick={navigateToNewWalletPage} text={buttonText} />
      <StickerPlayer lottie={moneyLottie} />
      <Block margin="top" marginValue={16}>
        <Text type="title1" align="center" weight="bold">
          Wallet Connected
          <br />
          {collapsedAddress}
        </Text>
      </Block>
    </PageLayout>
  )
}
