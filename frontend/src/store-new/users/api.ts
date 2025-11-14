import { User, WalletTonProof } from '@types'

import { ApiService, ApiServiceResponse } from '@services'

export const fetchUserAPI = async (): Promise<ApiServiceResponse<User>> => {
  const response = await ApiService.get<User>({
    endpoint: '/users/me',
  })

  return response
}

export const connectWalletAPI = async (
  chatSlug: string,
  walletTonProof: WalletTonProof
): Promise<ApiServiceResponse<any>> => {
  const response = await ApiService.post<any>({
    endpoint: '/users/wallet',
    data: {
      chatSlug: chatSlug,
      walletDetails: walletTonProof,
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
