import { useNavigate } from 'react-router-dom'

interface AppNavigateParams {
  channelId?: string
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

      if (params?.channelId) {
        url = url.replace(':channelId', params.channelId)
      }

      if (params?.conditionId) {
        url = url.replace(':conditionId', params.conditionId)
      }

      navigate(url)
    },
  }
}
