import { ToastProvider } from '@components'
import { ThemeContext } from '@context'
import { useAppNavigation } from '@hooks'
import '@styles/index.scss'
import { AppRoot } from '@telegram-apps/telegram-ui'
import '@telegram-apps/telegram-ui/dist/styles.css'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { checkStartAppParams } from '@utils'
import { useContext, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import config from '@config'
import { useUser, useUserActions } from '@store'

import Routes, { ROUTES_NAME } from './Routes'

const webApp = window.Telegram?.WebApp

const HARDCODED_PLATFORM = 'ios'
const HARDCODED_APPEARANCE = 'dark'

function App() {
  const { clientChatSlug } = useParams<{ clientChatSlug: string }>()
  const { appNavigate } = useAppNavigation()
  const { darkTheme } = useContext(ThemeContext)

  const { authenticateUserAction, fetchUserAction } = useUserActions()
  const { isAuthenticated } = useUser()

  const authenticateUser = async () => {
    try {
      await authenticateUserAction()
    } catch (error) {
      console.error(error)
    }
  }

  const fetchUser = async () => {
    try {
      await fetchUserAction()
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      darkTheme ? 'dark' : 'light'
    )

    if (darkTheme) {
      window.document.documentElement.style.backgroundColor = '#1c1c1e'
      webApp?.setHeaderColor('#1c1c1e')
      webApp?.setBackgroundColor('#1c1c1e')
    } else {
      window.document.documentElement.style.backgroundColor = '#EFEFF4'
      webApp?.setHeaderColor('#EFEFF4')
      webApp?.setBackgroundColor('#EFEFF4')
    }
  }, [darkTheme])

  useEffect(() => {
    const ch = checkStartAppParams()
    if (ch) {
      appNavigate({
        path: ROUTES_NAME.CLIENT_TASKS,
        params: {
          clientChatSlug: ch,
        },
      })
      return
    }
    authenticateUser()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser()
    }
  }, [isAuthenticated])

  if (!isAuthenticated) return null

  return (
    <TonConnectUIProvider
      manifestUrl={config.tonConnectManifestUrl}
      // actionsConfiguration={{
      //   twaReturnUrl: `https://t.me/${config.botName}?startapp=ch_${clientChatSlug}`,
      // }}
    >
      <AppRoot
        platform={HARDCODED_PLATFORM}
        appearance={HARDCODED_APPEARANCE}
        id="app-tg-root"
      >
        <ToastProvider>{Routes}</ToastProvider>
      </AppRoot>
    </TonConnectUIProvider>
  )
}

export default App
