import React, { useState, useEffect } from 'react'

import { ThemeContext } from './ThemeContext'

interface Props {
  children?: React.ReactNode
}

const webApp = window.Telegram?.WebApp

export const ThemeProvider = ({ children }: Props) => {
  const lightTgTheme = webApp?.colorScheme === 'light'

  const [darkTheme, setDarkTheme] = useState(!lightTgTheme)

  useEffect(() => {
    // Проверяем наличие цвета кнопки и устанавливаем fallback если его нет
    if (!webApp?.themeParams?.button_color) {
      document.documentElement.style.setProperty(
        '--color-accentsBrandCommunity',
        '#007aff'
      )
    }
  }, [])

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
