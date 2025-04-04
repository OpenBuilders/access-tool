import { ROUTES_NAME } from '@routes'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppNavigation } from './useAppNavigation'
import { useToast } from './useToast'

export const useError = () => {
  const { appNavigate } = useAppNavigation()
  const [isRedirect, setIsRedirect] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    if (isRedirect) {
      appNavigate({ path: ROUTES_NAME.MAIN })
    }
  }, [isRedirect])

  return {
    pageNotFound: (error: string) => {
      showToast({
        description: error,
        icon: 'error',
      })
      setIsRedirect(true)
    },
  }
}
