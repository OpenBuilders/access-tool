import { createContext } from 'react'

interface ContextProps {
  darkTheme: boolean
  toggleTheme: () => void
}

export const ThemeContext = createContext<ContextProps>({
  darkTheme: true,
  toggleTheme: () => {},
})
