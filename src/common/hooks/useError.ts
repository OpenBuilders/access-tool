import { useToast } from '@components'
import { ROUTES_NAME } from '@routes'
import { useEffect, useState } from 'react'

import { useAppNavigation } from './useAppNavigation'

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
        message: error,
        type: 'error',
      })
      setIsRedirect(true)
    },
  }
}
