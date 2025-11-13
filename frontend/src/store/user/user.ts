import { create } from 'zustand'

import config from '@config'
import { AuthService } from '@services'

import { createSelectors } from '../types'
import {
  authenticateUserAPI,
  completeChatTasksAPI,
  connectExistingWalletAPI,
  connectWalletAPI,
  fetchUserAPI,
} from './api'
import { User, WalletData } from './types'

interface UserStore {
  isAuthenticated: boolean
  user: User | null
}

interface UserActions {
  actions: {
    fetchUserAction: () => void
    authenticateUserAction: () => void
    connectWalletAction: (
      chatSlug: string,
      wallet: WalletData
    ) => Promise<string>
    connectExistingWalletAction: (
      chatSlug: string,
      wallet: string
    ) => Promise<string>
    completeChatTaskAction: (taskId: string) => void
  }
}

const webApp = window.Telegram?.WebApp

const useUserStore = create<UserStore & UserActions>((set) => ({
  isAuthenticated: false,
  user: null,
  actions: {
    authenticateUserAction: async () => {
      if (config.isDev && !webApp?.initData) {
        set({ isAuthenticated: true })
        return
      }

      const { data, ok, error } = await authenticateUserAPI()

      if (!ok || !data?.access_token) {
        throw new Error(error)
      }

      AuthService.setCredentials({ accessToken: data?.access_token })

      set({ isAuthenticated: true })
    },
    fetchUserAction: async () => {
      const { data, ok, error } = await fetchUserAPI()

      if (!ok) {
        throw new Error(error)
      }

      set({ user: data })
    },
    connectWalletAction: async (chatSlug: string, wallet: WalletData) => {
      const { data, ok, error } = await connectWalletAPI(chatSlug, wallet)

      if (!ok || !data?.user || !data?.taskId) {
        throw new Error(error)
      }

      set({ user: data.user })
      return data?.taskId
    },
    connectExistingWalletAction: async (chatSlug: string, wallet: string) => {
      const { data, ok, error } = await connectExistingWalletAPI(
        chatSlug,
        wallet
      )

      if (!ok || !data?.user || !data?.taskId) {
        throw new Error(error)
      }

      set({ user: data.user })
      return data?.taskId
    },
    completeChatTaskAction: async (taskId: string) => {
      const { ok, error } = await completeChatTasksAPI(taskId)

      if (!ok) {
        throw new Error(error)
      }
    },
  },
}))

export const useUserActions = () => useUserStore((state) => state.actions)

export const useUser = createSelectors(useUserStore)
