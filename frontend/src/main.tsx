import { ToastProvider } from '@components'
import { TanStackProvider, ThemeProvider } from '@context'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ToastProvider>
      <TanStackProvider>
        <BrowserRouter>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </BrowserRouter>
      </TanStackProvider>
    </ToastProvider>
  </StrictMode>
)
