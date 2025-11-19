import { ThemeContext } from '@context'
import '@styles/index.scss'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { checkIsMobile, checkStartAppParams } from '@utils'
import { useContext, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import config from '@config'
import { AuthService } from '@services'
import { useUser, useUserActions } from '@store'
import { useAuthQuery } from '@store-new'

import Routes from './Routes'

const webApp = window.Telegram?.WebApp

function App() {
  const { clientChatSlug } = useParams<{ clientChatSlug: string }>()
  const { darkTheme } = useContext(ThemeContext)
  const navigate = useNavigate()

  // useAuthQuery()

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
      webApp?.setBackgroundColor('#1c1c1e')
      webApp?.setHeaderColor('#1c1c1e')
      webApp?.setBottomBarColor('#1c1c1e')
    } else {
      window.document.documentElement.style.backgroundColor = '#EFEFF4'
      webApp?.setBackgroundColor('#EFEFF4')
      webApp?.setHeaderColor('#EFEFF4')
      webApp?.setBottomBarColor('#EFEFF4')
    }

    // const { isMobile } = checkIsMobile()

    // if (!isMobile) return

    // webApp?.requestFullscreen()
    // webApp?.lockOrientation()
    // webApp?.disableVerticalSwipes()
  }, [darkTheme])

  useEffect(() => {
    const ch = checkStartAppParams()
    if (ch) {
      navigate(`/client/${ch}`)
      return
    }
  }, [])

  useEffect(() => {
    webApp?.disableVerticalSwipes()
    if (location.pathname && !location.pathname.includes('client')) {
      webApp?.expand()
    }
  }, [location.pathname])

  useEffect(() => {
    if (!isAuthenticated) {
      authenticateUser()
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser()
    }
  }, [isAuthenticated])

  if (!isAuthenticated) return null

  // if (!AuthService.isAuth()) return null

  return (
    <TonConnectUIProvider
      manifestUrl={config.tonConnectManifestUrl}
      actionsConfiguration={{
        twaReturnUrl: `https://t.me/${config.botName}/gate?startapp=ch_${clientChatSlug}`,
      }}
    >
      {Routes}
    </TonConnectUIProvider>
  )
}

export default App
