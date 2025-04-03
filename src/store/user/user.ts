import { create } from 'zustand'

import { ApiService } from '@services'

import { fetchUserAPI } from './api'

interface UserStore {
  user: any
}

interface UserActions {
  actions: {
    fetchUser: () => void
  }
}

export const useUserStore = create<UserStore & UserActions>((set) => ({
  user: null,
  actions: {
    fetchUser: async () => {
      const { data, ok, error } = await fetchUserAPI()

      if (!ok) {
        throw new Error(error)
      }

      console.log(data)

      set({ user: data })
    },
  },
}))

export const useUserActions = () => useUserStore((state) => state.actions)

export const useUser = () => useUserStore((state) => ({ user: state.user }))
