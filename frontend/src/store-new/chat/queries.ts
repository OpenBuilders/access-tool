import { useQuery } from '@tanstack/react-query'
import { ChatPopularResponse, ChatsPopularOrderBy } from '@types'
import { TANSTACK_GC_TIME, TANSTACK_KEYS, TANSTACK_TTL } from '@utils'
import { useNavigate } from 'react-router-dom'

import { fetchChatAPI, fetchChatsPopularAPI } from './api'

export const useChatsPopularQuery = (orderBy: ChatsPopularOrderBy) => {
  return useQuery<ChatPopularResponse>({
    queryKey: TANSTACK_KEYS.CHATS_POPULAR(orderBy),
    queryFn: async () => {
      const { data, ok, error } = await fetchChatsPopularAPI(orderBy)

      if (!ok || !data) {
        throw new Error(error)
      }

      return data
    },
    gcTime: TANSTACK_GC_TIME,
    staleTime: TANSTACK_TTL.CHATS_POPULAR,
    meta: { persist: true },
  })
}

export const useChatQuery = (slug?: string) => {
  return useQuery<any>({
    queryKey: TANSTACK_KEYS.CHAT(slug ?? ''),
    queryFn: async () => {
      if (!slug) return

      const { data, ok, error } = await fetchChatAPI(slug)

      if (!ok || !data) {
        throw new Error(error)
      }

      return data
    },
    gcTime: TANSTACK_GC_TIME,
    staleTime: TANSTACK_TTL.CHAT,
    enabled: !!slug,
    meta: { persist: true },
  })
}
