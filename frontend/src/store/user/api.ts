import { ApiService, ApiServiceResponse } from '@services'

import { AuthenticatedUser, ChatTaskComplete, User, WalletData } from './types'

const webApp = window?.Telegram?.WebApp

export const authenticateUserAPI = async (): Promise<
  ApiServiceResponse<AuthenticatedUser>
> => {
  const response = await ApiService.post<AuthenticatedUser>({
    endpoint: '/auth/telegram',
    data: { initDataRaw: webApp?.initData },
  })

  return response
}

export const fetchUserAPI = async (): Promise<ApiServiceResponse<User>> => {
  const response = await ApiService.get<User>({
    endpoint: '/users/me',
  })

  return response
}

export const connectWalletAPI = async (
  chatSlug: string,
  walletData: WalletData
): Promise<ApiServiceResponse<any>> => {
  const response = await ApiService.post<any>({
    endpoint: '/users/wallet',
    data: {
      chatSlug: chatSlug,
      walletDetails: walletData,
    },
  })

  return response
}

export const connectExistingWalletAPI = async (
  chatSlug: string,
  wallet: string
): Promise<ApiServiceResponse<any>> => {
  const response = await ApiService.put<any>({
    endpoint: '/users/wallet',
    data: {
      chatSlug: chatSlug,
      walletAddress: wallet,
    },
  })

  return response
}

export const disconnectWalletAPI = async (
  chatSlug: string
): Promise<ApiServiceResponse<any>> => {
  const response = await ApiService.delete<any>({
    endpoint: `/users/wallet?chatSlug=${chatSlug}`,
  })

  return response
}

export const completeChatTasksAPI = async (
  taskId: string
): Promise<ApiServiceResponse<ChatTaskComplete>> => {
  const response = await ApiService.get<ChatTaskComplete>({
    endpoint: `/system/async-tasks/${taskId}`,
  })

  return response
}
