import { Icon } from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import cs from '@styles/commonStyles.module.scss'
import { Cell, Navigation, Text } from '@telegram-apps/telegram-ui'
import { toUserFriendlyAddress, useTonConnectUI } from '@tonconnect/ui-react'
import { collapseAddress } from '@utils'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import { useChat, useChatActions, useUserActions, WalletData } from '@store'

export const WalletCondition = () => {
  const { appNavigate } = useAppNavigation()
  const params = useParams<{ clientChatSlug: string }>()

  const chatSlugParam = params.clientChatSlug || ''

  const { chatWallet } = useChat()
  const { fetchUserChatAction } = useChatActions()
  const {
    connectWalletAction,
    completeChatTaskAction,
    connectExistingWalletAction,
  } = useUserActions()

  const searchParams = new URLSearchParams(window.location.search)
  const connectWalletQuery = searchParams.get('connectWallet')

  const [tonConnectUI, setOptions] = useTonConnectUI()

  //   const checkTaskCompleted = async () => {
  //     if (!chatWallet) return
  //     try {
  //       const taskId = await connectExistingWalletAction(
  //         chatSlugParam,
  //         chatWallet
  //       )
  //       if (taskId) {
  //         await handleCompleteTask(taskId)
  //       }
  //     } catch (error) {
  //       console.error(error)
  //     }
  //   }

  const fetchUserChat = async () => {
    try {
      await fetchUserChatAction(chatSlugParam)
    } catch (error) {
      console.error(error)
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeChatTaskAction(taskId)
      await fetchUserChat()
    } catch (error) {
      console.error(error)
    }
  }

  const handleConnectWallet = async (walletData: WalletData) => {
    if (!chatSlugParam) return
    let taskId = null
    try {
      taskId = await connectWalletAction(chatSlugParam, walletData)
    } catch (error) {
      console.error(error)
    } finally {
      return taskId
    }
  }

  const handleWalletDisconnect = () => {
    try {
      tonConnectUI.disconnect()
    } catch (error) {
      console.error(error)
    }
  }

  const handleOpenWalletConnect = () => {
    handleWalletDisconnect()

    const payload = uuidv4()

    tonConnectUI.setConnectRequestParameters({
      state: 'ready',
      value: { tonProof: payload },
    })

    tonConnectUI.openModal()
  }

  useEffect(() => {
    tonConnectUI.onStatusChange(async (wallet) => {
      if (
        wallet?.connectItems?.tonProof &&
        'proof' in wallet.connectItems.tonProof
      ) {
        const data = {
          tonProof: wallet.connectItems.tonProof.proof,
          walletAddress: wallet.account.address,
          publicKey: wallet.account.publicKey || '',
        }
        const taskId = await handleConnectWallet(data)
        if (taskId) {
          await handleCompleteTask(taskId)
        }
      }
    })
  }, [tonConnectUI])

  useEffect(() => {
    if (connectWalletQuery) {
      handleOpenWalletConnect()
    }
  }, [connectWalletQuery])

  if (!chatWallet) {
    return (
      <Navigation className={cs.pr12}>
        <Cell
          before={<Icon name="cross" size={20} />}
          className={cs.py10}
          onClick={handleOpenWalletConnect}
        >
          <Text className={cs.colorPrimary}>Connect Wallet</Text>
        </Cell>
      </Navigation>
    )
  }

  const navigateToConnectedWalletPage = () => {
    appNavigate({
      path: ROUTES_NAME.CLIENT_CONNECTED_WALLET,
      params: { clientChatSlug: chatSlugParam },
    })
  }

  const userFriendlyAddress = toUserFriendlyAddress(chatWallet)
  const collapsedAddress = collapseAddress(userFriendlyAddress, 4)

  return (
    <Navigation className={cs.pr12}>
      <Cell
        before={<Icon name="check" size={20} />}
        className={cs.py10}
        after={collapsedAddress}
        onClick={navigateToConnectedWalletPage}
      >
        <Text className={cs.colorPrimary}>Connect Wallet</Text>
      </Cell>
    </Navigation>
  )
}
