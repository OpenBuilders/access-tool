import { useQuery } from '@tanstack/react-query'
import { TANSTACK_GC_TIME, TANSTACK_KEYS, TANSTACK_TTL } from '@utils'

import config from '@config'
import { AuthService } from '@services'

import { authAPI } from './api'

export const useAuthQuery = () => {
  const webApp = window.Telegram?.WebApp
  return useQuery<null>({
    queryKey: TANSTACK_KEYS.AUTH,
    queryFn: async () => {
      if (config.isDev && !webApp?.initData) {
        AuthService.setCredentials({ accessToken: config?.accessToken ?? null })
        return null
      }

      const { data, ok, error } = await authAPI()

      if (!ok || !data?.access_token) {
        throw new Error(error)
      }

      AuthService.setCredentials({ accessToken: data.access_token })

      return null
    },
    gcTime: TANSTACK_GC_TIME,
    staleTime: TANSTACK_TTL.AUTH,
    meta: { persist: true },
  })
}
