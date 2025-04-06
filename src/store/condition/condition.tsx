import { create } from 'zustand'

import { createSelectors } from '../types'
import { createConditionJettonApi, fetchJettonsListApi } from './api'
import {
  Condition,
  ConditionCategory,
  ConditionJetton,
  PrefetchJetton,
} from './types'

interface ConditionStore {
  isValid: boolean
  condition: Condition | null
}

interface ConditionActions {
  actions: {
    setInitialConditionAction: (condition: Condition) => void
    createConditionJettonAction: (chatSlug: string) => void
    handleChangeConditionFieldAction: (
      field: string,
      value: string | number
    ) => void
    setIsValidAction: (value: boolean) => void
    prefetchJettonAction: (
      address: string
    ) => Promise<PrefetchJetton | undefined>
  }
}

const useConditionStore = create<ConditionStore & ConditionActions>(
  (set, get) => ({
    isValid: false,
    condition: null,
    actions: {
      setInitialConditionAction: (condition: Condition) => {
        set({ condition })
      },
      createConditionJettonAction: async (chatSlug: string) => {
        const { data, ok, error } = await createConditionJettonApi(chatSlug)

        if (!ok) {
          throw new Error(error)
        }
      },
      handleChangeConditionFieldAction: (field, value) => {
        set((state) => ({
          ...state,
          condition: {
            ...state.condition,
            [field]: value,
          } as Condition,
        }))
      },

      setIsValidAction: (value) => {
        set((state) => ({
          ...state,
          isValid: value,
        }))
      },
      prefetchJettonAction: async (address) => {
        const { data, ok, error } = await fetchJettonsListApi(address)

        if (!ok) {
          throw new Error(error)
        }

        return data
      },
    },
  })
)

export const useConditionActions = () =>
  useConditionStore((state) => state.actions)
export const useCondition = createSelectors(useConditionStore)
