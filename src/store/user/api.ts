import { ApiService, ApiServiceResponse } from '@services'

import { AuthenticatedUser, UserChat, User } from './types'

const webApp = window.Telegram.WebApp

export const authenticateUserAPI = async (): Promise<
  ApiServiceResponse<AuthenticatedUser>
> => {
  console.log(webApp)
  const response = await ApiService.post<AuthenticatedUser>({
    endpoint: '/auth/telegram',
    data: { initDataRaw: webApp.initData },
  })

  return response
}

export const fetchUserAPI = async (): Promise<ApiServiceResponse<User>> => {
  const response = await ApiService.get<User>({
    endpoint: '/users/me',
  })

  return response
}

export const fetchUserChatsAPI = async (): Promise<
  ApiServiceResponse<UserChat[]>
> => {
  const response = await ApiService.get<UserChat[]>({
    endpoint: '/admin/chats',
  })

  return response
}
