import { create } from 'zustand'

import config from '@config'
import { AuthService, LocalStorageService } from '@services'

import { createSelectors } from '../types'
import { authenticateUserAPI, fetchUserAPI, fetchUserChatsAPI } from './api'
import { User, UserChat } from './types'

interface UserStore {
  isAuthenticated: boolean
  user: User | null
  userChats: UserChat[] | null
}

interface UserActions {
  actions: {
    fetchUserAction: () => void
    fetchUserChatsAction: () => void
    authenticateUserAction: () => void
  }
}

export const useUserStore = create<UserStore & UserActions>((set) => ({
  isAuthenticated: false,
  user: null,
  userChats: null,
  actions: {
    authenticateUserAction: async () => {
      if (config.isDev) {
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
    fetchUserChatsAction: async () => {
      const { data, ok, error } = await fetchUserChatsAPI()

      if (!ok) {
        throw new Error(error)
      }

      set({ userChats: data })
    },
  },
}))

export const useUserActions = () => useUserStore((state) => state.actions)

export const useUser = createSelectors(useUserStore)
