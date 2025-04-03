import { ApiService, ApiServiceResponse } from '@services'

import { AuthenticatedUser, Chat, User } from './types'

const webApp = window.Telegram.WebApp

export const authenticateUserAPI = async (): Promise<
  ApiServiceResponse<AuthenticatedUser>
> => {
  const response = await ApiService.post<AuthenticatedUser>({
    endpoint: '/auth/telegram',
    data: {
      initData: webApp.initData,
    },
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
  ApiServiceResponse<Chat[]>
> => {
  const response = await ApiService.get<Chat[]>({
    endpoint: '/admin/chats',
  })

  return response
}
