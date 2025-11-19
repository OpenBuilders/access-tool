import { useMutation, useQuery } from '@tanstack/react-query'
import { User, WalletTonProof } from '@types'
import { TANSTACK_GC_TIME, TANSTACK_KEYS, TANSTACK_TTL } from '@utils'

import {
  connectExistingWalletAPI,
  connectWalletAPI,
  disconnectWalletAPI,
  fetchUserAPI,
} from './api'

export const useUserQuery = () => {
  return useQuery<User>({
    queryKey: TANSTACK_KEYS.USER,
    queryFn: async () => {
      const { data, ok, error } = await fetchUserAPI()

      if (!ok || !data) {
        throw new Error(error)
      }

      return data
    },
    gcTime: TANSTACK_GC_TIME,
    staleTime: TANSTACK_TTL.USER,
    meta: { persist: true },
  })
}

export const useUserConnectWalletQuery = (
  chatSlug: string,
  walletTonProof: WalletTonProof
) => {
  return useMutation<any>({
    mutationFn: async () => {
      const { data, ok, error } = await connectWalletAPI(
        chatSlug,
        walletTonProof
      )

      if (!ok || !data) {
        throw new Error(error)
      }

      return data
    },
  })
}

export const useUserConnectExistingWalletQuery = (
  chatSlug: string,
  wallet: string
) => {
  return useMutation<any>({
    mutationFn: async () => {
      const { data, ok, error } = await connectExistingWalletAPI(
        chatSlug,
        wallet
      )

      if (!ok || !data) {
        throw new Error(error)
      }

      return data
    },
  })
}

export const useUserDisconnectWalletQuery = (chatSlug: string) => {
  return useMutation<any>({
    mutationFn: async () => {
      const { data, ok, error } = await disconnectWalletAPI(chatSlug)

      if (!ok || !data) {
        throw new Error(error)
      }

      return data
    },
  })
}
