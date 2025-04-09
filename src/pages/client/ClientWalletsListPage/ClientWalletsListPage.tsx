import walletLottie from '@assets/wallet.json'
import { Container, StickerPlayer } from '@components'
import { TelegramBackButton, TelegramMainButton } from '@components'
import { PageLayout } from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import cs from '@styles/commonStyles.module.scss'
import {
  Title,
  Text,
  Section,
  Cell,
  Navigation,
} from '@telegram-apps/telegram-ui'
import { toUserFriendlyAddress } from '@tonconnect/ui-react'
import { collapseAddress } from '@utils'
import cn from 'classnames'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { useChat, useChatActions, useUser, useUserActions } from '@store'

export const ClientWalletsListPage = () => {
  const params = useParams<{ clientChatSlug: string }>()
  const chatSlugParam = params.clientChatSlug || ''

  const { appNavigate } = useAppNavigation()

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

  if (!user) return null

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
    } catch (error) {
      console.error(error)
    } finally {
      navigateToTasksPage()
    }
  }

  const walletList = user.wallets?.filter((wallet) => wallet !== chatWallet)

  return (
    <PageLayout>
      <TelegramBackButton onClick={navigateToTasksPage} />
      <TelegramMainButton
        text="Connect New Wallet"
        onClick={navigateToTasksPageWithWalletConnect}
      />
      <StickerPlayer lottie={walletLottie} />
      <Title weight="2" plain level="1" className={cn(cs.textCenter, cs.mt16)}>
        Select a Wallet
      </Title>
      <Text className={cn(cs.textCenter, cs.mt8, cs.colorHint)}>
        These are the wallets you’ve previously connected — choose one or add a
        new one.
      </Text>
      <Container className={cs.mt24}>
        <Section>
          {walletList.map((wallet) => {
            const userFriendlyAddress = toUserFriendlyAddress(wallet)
            const collapsedAddress = collapseAddress(userFriendlyAddress, 4)

            return (
              <Navigation className={cs.pr12}>
                <Cell
                  className={cs.py10}
                  onClick={() => connectExistingWallet(wallet)}
                >
                  <Text className={cs.colorPrimary}>{collapsedAddress}</Text>
                </Cell>
              </Navigation>
            )
          })}
        </Section>
      </Container>
    </PageLayout>
  )
}
