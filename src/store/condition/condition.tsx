import { create } from 'zustand'

import { createSelectors } from '../types'
import {
  createConditionApi,
  deleteConditionApi,
  fetchConditionApi,
  prefetchConditionDataApi,
  updateConditionApi,
} from './api'
import { getConditionInitialState } from './helpers'
import {
  Condition,
  ConditionCreateArgs,
  ConditionDeleteArgs,
  ConditionFetchArgs,
  ConditionType,
  ConditionUpdateArgs,
  PrefetchedConditionData,
} from './types'

interface ConditionStore {
  isValid: boolean
  isFieldChanged: boolean
  condition: Condition | null
  prefetchedConditionData: PrefetchedConditionData | null
}

interface ConditionActions {
  actions: {
    setInitialConditionAction: (condition: Condition) => void
    // Condition Actions
    fetchConditionAction: (args: ConditionFetchArgs) => void
    updateConditionAction: (args: ConditionUpdateArgs) => void
    createConditionAction: (args: ConditionCreateArgs) => void
    deleteConditionAction: (args: ConditionDeleteArgs) => void
    // Common Actions
    handleChangeConditionFieldAction: (
      field: string,
      value: string | number
    ) => void
    setIsValidAction: (value: boolean) => void
    prefetchConditionDataAction: (type: ConditionType, address: string) => void
    resetPrefetchedConditionDataAction: () => void
  }
}

const useConditionStore = create<ConditionStore & ConditionActions>(
  (set, get) => ({
    isValid: false,
    isFieldChanged: false,
    condition: null,
    prefetchedConditionData: null,
    actions: {
      setInitialConditionAction: (condition: Condition) => {
        set({ condition })
      },

      fetchConditionAction: async (args: ConditionFetchArgs) => {
        if (!args.conditionId) {
          const initialCondition = getConditionInitialState(args.type)

          set({ condition: initialCondition })
          return
        }

        const { data, ok, error } = await fetchConditionApi(args)

        if (!ok) {
          throw new Error(error)
        }

        set({ condition: data })
      },

      createConditionAction: async (args: ConditionCreateArgs) => {
        const { ok, error } = await createConditionApi(args)

        if (!ok) {
          throw new Error(error)
        }

        set({ condition: null })
      },

      updateConditionAction: async (args: ConditionUpdateArgs) => {
        const { ok, error } = await updateConditionApi(args)

        if (!ok) {
          throw new Error(error)
        }

        set({ condition: null, isFieldChanged: false })
      },

      deleteConditionAction: async (args: ConditionDeleteArgs) => {
        const { ok, error } = await deleteConditionApi(args)

        if (!ok) {
          throw new Error(error)
        }

        set({ condition: null })
      },

      handleChangeConditionFieldAction: (field, value) => {
        set((state) => ({
          ...state,
          isFieldChanged: true,
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

      prefetchConditionDataAction: async (type, address) => {
        const { data, ok, error } = await prefetchConditionDataApi(
          type,
          address
        )

        if (!ok) {
          throw new Error(error)
        }

        set({ prefetchedConditionData: data })
      },

      resetPrefetchedConditionDataAction: () => {
        set({ prefetchedConditionData: null })
      },
    },
  })
)

export const useConditionActions = () =>
  useConditionStore((state) => state.actions)
export const useCondition = createSelectors(useConditionStore)
