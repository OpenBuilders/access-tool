import { useQuery } from '@tanstack/react-query'
import { AdminChat } from '@types'
import { TANSTACK_GC_TIME, TANSTACK_KEYS, TANSTACK_TTL } from '@utils'

import { fetchAdminChatsAPI } from './api'

export const useAdminChatsQuery = () => {
  return useQuery<AdminChat[]>({
    queryKey: TANSTACK_KEYS.ADMIN_CHATS,
    queryFn: async () => {
      const { data, ok, error } = await fetchAdminChatsAPI()

      if (!ok || !data) {
        throw new Error(error)
      }

      return data
    },
    gcTime: TANSTACK_GC_TIME,
    staleTime: TANSTACK_TTL.ADMIN_CHATS,
    meta: { persist: true },
  })
}
