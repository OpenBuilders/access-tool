import { useNavigate } from 'react-router-dom'

interface AppNavigateParams {
  chatSlug?: string
  conditionId?: string
}

interface AppNavigation {
  path: string
  params?: AppNavigateParams
}

export const useAppNavigation = () => {
  const navigate = useNavigate()

  return {
    appNavigate: (options: AppNavigation) => {
      const { path, params } = options
      let url = path

      if (params?.chatSlug) {
        url = url.replace(':chatSlug', params.chatSlug)
      }

      if (params?.conditionId) {
        url = url.replace(':conditionId', params.conditionId)
      }

      navigate(url, { replace: true })
    },
  }
}
