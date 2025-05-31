import React, { useState } from 'react'

import { ThemeContext } from './ThemeContext'

interface Props {
  children?: React.ReactNode
}

const webApp = window.Telegram?.WebApp

export const ThemeProvider = ({ children }: Props) => {
  const lightTgTheme = webApp.colorScheme !== 'light'

  const [darkTheme, setDarkTheme] = useState(!lightTgTheme)

  const toggleThemeHandler = () => {
    setDarkTheme((prevState) => !prevState)
  }

  return (
    <ThemeContext.Provider
      value={{
        darkTheme: darkTheme,
        toggleTheme: toggleThemeHandler,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
