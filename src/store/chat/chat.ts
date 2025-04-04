import { create } from 'zustand'

import { createSelectors } from '../types'
import { fetchChatAPI } from './api'
import { Chat } from './types'

interface ChatStore {
  chat: Chat | null
}

interface ChatActions {
  actions: {
    fetchChatAction: (slug: string) => void
  }
}

export const useChatStore = create<ChatStore & ChatActions>((set) => ({
  chat: null,
  actions: {
    fetchChatAction: async (slug) => {
      const { data, ok, error } = await fetchChatAPI(slug)

      if (!ok) {
        throw new Error(error)
      }

      set({ chat: data })
    },
  },
}))

export const useChatActions = () => useChatStore((state) => state.actions)

export const useChat = createSelectors(useChatStore)
