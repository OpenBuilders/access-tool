import { create } from 'zustand'

import { createSelectors } from '../types'
import { fetchChatAPI, updateChatAPI } from './api'
import { Chat, ChatInstance } from './types'

interface ChatStore {
  chat: Chat | null
}

interface ChatActions {
  actions: {
    fetchChatAction: (slug: string) => void
    updateChatAction: (slug: string, data: Partial<ChatInstance>) => void
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
    updateChatAction: async (slug, values) => {
      const { data, ok, error } = await updateChatAPI(slug, values)

      if (!ok) {
        throw new Error(error)
      }

      set({ chat: data })
    },
  },
}))

export const useChatActions = () => useChatStore((state) => state.actions)

export const useChat = createSelectors(useChatStore)
