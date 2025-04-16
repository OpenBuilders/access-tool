import { create } from 'zustand'

import { createSelectors } from '../types'
import { APP_LOADING_TIMEOUT } from './constants'

interface AppState {
  isLoading: boolean
}

interface AppActions {
  actions: {
    toggleIsLoadingAction: (value: boolean) => void
  }
}

const useAppStore = create<AppState & AppActions>((set) => ({
  isLoading: true,
  actions: {
    toggleIsLoadingAction: (value) => {
      if (value) {
        set({ isLoading: value })
      } else {
        setTimeout(() => {
          set({ isLoading: value })
        }, APP_LOADING_TIMEOUT)
      }
    },
  },
}))

export const useAppActions = () => useAppStore((state) => state.actions)
export const useApp = createSelectors(useAppStore)
