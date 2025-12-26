import { create } from 'zustand'

import { Condition, ConditionType } from '../condition'
import { createSelectors } from '../types'
import {
  fetchAdminUserChatsAPI,
  fetchChatAPI,
  fetchUserChatAPI,
  moveChatConditionApi,
  updateChatAPI,
  updateChatVisibilityAPI,
  updateChatFullControlAPI,
} from './api'
import { AdminChat, ChatGroup, ChatInstance } from './types'

interface ChatStore {
  adminChats: AdminChat[] | null
  chat: ChatInstance | null
  rules: Condition[] | null
  groups: ChatGroup[] | null
  chatWallet: string | null
}

interface ChatActions {
  actions: {
    fetchChatAction: (slug: string) => Promise<{
      chat: ChatInstance | null
      rules: Condition[] | null
      groups: ChatGroup[] | null
    }>
    updateChatAction: (slug: string, data: Partial<ChatInstance>) => void
    fetchAdminUserChatsAction: () => Promise<AdminChat[]>
    fetchUserChatAction: (slug: string) => Promise<boolean>
    updateChatVisibilityAction: (
      slug: string,
      data: Partial<ChatInstance>
    ) => void
    updateChatFullControlAction: (
      slug: string,
      data: {
        isEnabled: boolean
        effectiveInDays: number
      }
    ) => void
    resetChatAction: () => void
    moveChatConditionAction: (args: {
      ruleId: number
      groupId: number
      type: ConditionType
      order: number
      chatSlug: string
    }) => void
  }
}

const useChatStore = create<ChatStore & ChatActions>((set) => ({
  chat: null,
  rules: null,
  adminChats: null,
  chatWallet: null,
  groups: null,
  actions: {
    fetchChatAction: async (slug) => {
      const { data, ok, error } = await fetchChatAPI(slug)

      if (!ok || !data) {
        throw new Error(error || 'Chat not found')
      }

      set({ chat: data?.chat, rules: data?.rules, groups: data?.groups })

      return { chat: data?.chat, rules: data?.rules, groups: data?.groups }
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
    fetchAdminUserChatsAction: async () => {
      const { data, ok, error } = await fetchAdminUserChatsAPI()

      if (!ok || !data) {
        throw new Error(error)
      }

      set({ adminChats: data })

      return data
    },
    fetchUserChatAction: async (slug) => {
      const { data, ok, error } = await fetchUserChatAPI(slug)

      if (!ok || !data) {
        throw new Error(error)
      }

      set({
        chat: data?.chat,
        rules: data?.rules,
        chatWallet: data?.wallet,
        groups: data?.groups,
      })

      return data.chat.isEligible
    },
    updateChatVisibilityAction: async (slug, values) => {
      const { data, ok, error } = await updateChatVisibilityAPI(slug, values)

      if (!ok) {
        throw new Error(error)
      }

      if (!data) {
        throw new Error('Chat data not found')
      }

      set({ chat: data })
    },
    updateChatFullControlAction: async (slug, values) => {
      const { data, ok, error, status } = await updateChatFullControlAPI(
        slug,
        values
      )

      if (!ok) {
        if (status === 429) {
          throw new Error('Too many attempts. Try again in an hour')
        }
        throw new Error(error)
      }

      if (!data) {
        throw new Error('Chat data not found')
      }

      set({ chat: data })
    },
    resetChatAction: () => {
      set({ chat: null })
    },
    moveChatConditionAction: async (args) => {
      await moveChatConditionApi(args)

      // if (status !== 'success') {
      //   throw new Error(message)
      // }

      // set({
      //   rules: rules?.map((rule) =>
      //     rule.id === args.ruleId ? { ...rule, groupId: args.groupId } : rule
      //   ),
      // })
    },
  },
}))

export const useChatActions = () => useChatStore((state) => state.actions)

export const useChat = createSelectors(useChatStore)
