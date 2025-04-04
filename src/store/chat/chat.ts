import { create } from 'zustand'

import { createSelectors } from '../types'
import { fetchChatAPI } from './api'

interface ChatStore {
  chat: any
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

      console.log(data)

      set({ chat: data })
    },
  },
}))

export const useChatActions = () => useChatStore((state) => state.actions)

export const useChat = createSelectors(useChatStore)
