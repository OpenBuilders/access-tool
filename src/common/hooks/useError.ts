import { useToast } from '@components'
import { ROUTES_NAME } from '@routes'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useAppNavigation } from './useAppNavigation'

type RedirectType = 'adminMainPage' | 'adminChatPage'

export const useError = () => {
  const params = useParams<{ chatSlug: string }>()
  const { appNavigate } = useAppNavigation()
  const [isRedirect, setIsRedirect] = useState<RedirectType | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    if (isRedirect === 'adminMainPage') {
      appNavigate({ path: ROUTES_NAME.MAIN })
    }
    if (isRedirect === 'adminChatPage') {
      appNavigate({
        path: ROUTES_NAME.CHAT,
        params: { chatSlug: params.chatSlug },
      })
    }
  }, [isRedirect])

  return {
    adminChatNotFound: () => {
      showToast({
        message: 'Chat not found',
        type: 'error',
      })
      setIsRedirect('adminMainPage')
    },
    adminChatConditionNotFound: () => {
      showToast({
        message: 'Condition not found',
        type: 'error',
      })
      setIsRedirect('adminChatPage')
    },
  }
}
