import { create } from 'zustand'

import { createSelectors } from '../types'
import { createConditionJettonApi } from './api'
import { Condition, ConditionJetton } from './types'

interface ConditionStore {
  condition: any
}

interface ConditionActions {
  actions: {
    createConditionJettonAction: (chatSlug: string) => void
  }
}

const useConditionStore = create<ConditionStore & ConditionActions>((set) => ({
  condition: null,
  actions: {
    createConditionJettonAction: async (chatSlug: string) => {
      const { data, ok, error } = await createConditionJettonApi(chatSlug)

      if (!ok) {
        throw new Error(error)
      }

      if (!data) {
        throw new Error('Condition data not found')
      }
    },
  },
}))

export const useConditionActions = () =>
  useConditionStore((state) => state.actions)
export const useCondition = createSelectors(useConditionStore)
