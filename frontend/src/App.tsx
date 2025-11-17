import { ThemeContext } from '@context'
import '@styles/index.scss'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { checkIsMobile, checkStartAppParams } from '@utils'
import { useContext, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import config from '@config'
import { AuthService } from '@services'
import { useAuthQuery } from '@store-new'

import Routes from './Routes'

const webApp = window.Telegram?.WebApp

function App() {
  const { clientChatSlug } = useParams<{ clientChatSlug: string }>()
  const { darkTheme } = useContext(ThemeContext)
  const navigate = useNavigate()

  useAuthQuery()

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

    const { isMobile } = checkIsMobile()

    if (!isMobile) return

    webApp?.requestFullscreen()
    webApp?.lockOrientation()
    webApp?.disableVerticalSwipes()
  }, [darkTheme])

  useEffect(() => {
    const ch = checkStartAppParams()
    if (ch) {
      navigate(`/client/${ch}`, { state: { closeApp: true } })
      return
    }
  }, [])

  if (!AuthService.isAuth()) return null

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
