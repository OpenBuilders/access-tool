import { useNavigate } from 'react-router-dom'

interface AppNavigateParams {
  chatSlug?: string
  conditionId?: number
  conditionType?: string
  clientChatSlug?: string
}

interface AppNavigation {
  path: string
  params?: AppNavigateParams
  queryParams?: Record<string, string>
}

export const useAppNavigation = () => {
  const navigate = useNavigate()

  return {
    appNavigate: (options: AppNavigation) => {
      const { path, params, queryParams } = options
      let url = path

      if (params?.chatSlug) {
        url = url.replace(':chatSlug', params.chatSlug)
      }

      if (params?.conditionId) {
        url = url.replace(':conditionId', params.conditionId.toString())
      }

      if (params?.conditionType) {
        url = url.replace(':conditionType', params.conditionType)
      }

      if (queryParams) {
        url = url + '?' + new URLSearchParams(queryParams).toString()
      }

      if (params?.clientChatSlug) {
        url = url.replace(':clientChatSlug', params.clientChatSlug)
      }

      navigate(url, { replace: true })
    },
  }
}
