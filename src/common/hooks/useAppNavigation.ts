import { useNavigate } from 'react-router-dom'

interface AppNavigateParams {
  channelSlug?: string
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

      if (params?.channelSlug) {
        url = url.replace(':channelSlug', params.channelSlug)
      }

      if (params?.conditionId) {
        url = url.replace(':conditionId', params.conditionId)
      }

      navigate(url)
    },
  }
}
