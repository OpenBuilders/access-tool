import { ToastProvider } from '@components'
import { ThemeContext } from '@context'
import '@styles/index.scss'
import { AppRoot } from '@telegram-apps/telegram-ui'
import '@telegram-apps/telegram-ui/dist/styles.css'
import { useContext, useEffect } from 'react'

import { useUser, useUserActions } from '@store'

import Routes from './Routes'

const webApp = window.Telegram?.WebApp

const HARDCODED_PLATFORM = 'ios'
const HARDCODED_APPEARANCE = 'dark'

function App() {
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
    authenticateUser()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser()
    }
  }, [isAuthenticated])

  if (!isAuthenticated) return null

  return (
    <AppRoot
      platform={HARDCODED_PLATFORM}
      appearance={HARDCODED_APPEARANCE}
      id="app-tg-root"
    >
      <ToastProvider>{Routes}</ToastProvider>
    </AppRoot>
  )
}

export default App
