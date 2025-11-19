import { Auth } from '@types'

import { ApiService, ApiServiceResponse } from '@services'

export const authAPI = async (): Promise<ApiServiceResponse<Auth>> => {
  const webApp = window?.Telegram?.WebApp

  const response = await ApiService.post<Auth>({
    endpoint: '/auth/telegram',
    data: { initDataRaw: webApp?.initData },
  })

  return response
}
