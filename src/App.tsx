import '@common/styles/index.scss'
import { ThemeContext } from '@context'
import { AppRoot } from '@telegram-apps/telegram-ui'
import '@telegram-apps/telegram-ui/dist/styles.css'
import { useContext, useEffect } from 'react'

import Routes from './Routes'

const webApp = window.Telegram?.WebApp

const HARDCODED_PLATFORM = 'ios'
const HARDCODED_APPEARANCE = 'dark'

function App() {
  const { darkTheme } = useContext(ThemeContext)

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

  return (
    <AppRoot
      platform={HARDCODED_PLATFORM}
      appearance={HARDCODED_APPEARANCE}
      id="app-tg-root"
    >
      {Routes}
    </AppRoot>
  )
}

export default App
