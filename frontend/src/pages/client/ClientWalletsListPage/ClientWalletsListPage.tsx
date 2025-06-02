import walletLottie from '@assets/wallet.json'
import {
  Block,
  List,
  ListItem,
  StickerPlayer,
  Text,
  useToast,
} from '@components'
import { TelegramBackButton, TelegramMainButton } from '@components'
import { PageLayout } from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { toUserFriendlyAddress } from '@tonconnect/ui-react'
import { collapseAddress } from '@utils'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useChat, useChatActions, useUser, useUserActions } from '@store'

import { Skeleton } from './Skeleton'

export const ClientWalletsListPage = () => {
  const params = useParams<{ clientChatSlug: string }>()
  const chatSlugParam = params.clientChatSlug || ''

  const { appNavigate } = useAppNavigation()

  const { showToast } = useToast()

  const { user } = useUser()
  const { completeChatTaskAction, connectExistingWalletAction } =
    useUserActions()

  const { chatWallet } = useChat()
  const { fetchUserChatAction } = useChatActions()

  const fetchUserChat = async () => {
    if (!chatSlugParam) return
    try {
      await fetchUserChatAction(chatSlugParam)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchUserChat()
  }, [chatSlugParam])

  const navigateToTasksPage = () => {
    appNavigate({
      path: ROUTES_NAME.CLIENT_TASKS,
      params: { clientChatSlug: chatSlugParam },
    })
  }

  const navigateToTasksPageWithWalletConnect = () => {
    appNavigate({
      path: ROUTES_NAME.CLIENT_TASKS,
      params: { clientChatSlug: chatSlugParam },
      queryParams: { connectWallet: 'true' },
    })
  }

  const connectExistingWallet = async (wallet: string) => {
    try {
      const taskId = await connectExistingWalletAction(chatSlugParam, wallet)
      if (taskId) {
        await completeChatTaskAction(taskId)
      }
      showToast({
        message: 'New wallet connected',
        type: 'success',
      })
    } catch (error) {
      console.error(error)
    } finally {
      navigateToTasksPage()
    }
  }

  const walletList = user?.wallets?.filter((wallet) => wallet !== chatWallet)

  return (
    <PageLayout>
      <TelegramBackButton onClick={navigateToTasksPage} />
      {!user || !walletList ? (
        <Skeleton />
      ) : (
        <>
          <TelegramMainButton
            text="Connect New Wallet"
            onClick={navigateToTasksPageWithWalletConnect}
          />
          <StickerPlayer lottie={walletLottie} />
          <Block margin="top" marginValue={16}>
            <Text type="title1" align="center" weight="medium">
              Select a Wallet
            </Text>
          </Block>
          <Block margin="top" marginValue={8}>
            <Text type="text" align="center" color="tertiary">
              These are the wallets you’ve previously
              <br />
              connected — choose one or add a new one.
            </Text>
          </Block>
          <Block margin="top" marginValue={24}>
            <List>
              {walletList.map((wallet) => {
                const userFriendlyAddress = toUserFriendlyAddress(wallet)
                const collapsedAddress = collapseAddress(userFriendlyAddress, 4)
                return (
                  <ListItem
                    key={wallet}
                    text={<Text type="text">{collapsedAddress}</Text>}
                    chevron
                    onClick={() => connectExistingWallet(wallet)}
                  />
                )
              })}
            </List>
          </Block>
        </>
      )}
    </PageLayout>
  )
}
