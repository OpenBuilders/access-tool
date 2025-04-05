import { create } from 'zustand'

import { createSelectors } from '../types'
import { fetchChatAPI, updateChatAPI } from './api'
import { Chat, ChatInstance, ChatRule } from './types'

interface ChatStore {
  chat: ChatInstance | null
  rules: ChatRule[] | null
}

interface ChatActions {
  actions: {
    fetchChatAction: (slug: string) => void
    updateChatAction: (slug: string, data: Partial<ChatInstance>) => void
  }
}

const useChatStore = create<ChatStore & ChatActions>((set, get) => ({
  chat: null,
  rules: null,
  actions: {
    fetchChatAction: async (slug) => {
      const { data, ok, error } = await fetchChatAPI(slug)

      if (!ok) {
        throw new Error(error)
      }

      set({ chat: data?.chat, rules: data?.rules })
    },
    updateChatAction: async (slug, values) => {
      const { data, ok, error } = await updateChatAPI(slug, values)

      if (!ok) {
        throw new Error(error)
      }

      if (!data) {
        throw new Error('Chat data not found')
      }

      set({
        chat: data,
      })
    },
  },
}))

export const useChatActions = () => useChatStore((state) => state.actions)

export const useChat = createSelectors(useChatStore)
