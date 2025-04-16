import { create } from 'zustand'

import { createSelectors } from '../types'
import {
  createConditionApi,
  deleteConditionApi,
  fetchConditionApi,
  fetchConditionCategoriesApi,
  prefetchConditionDataApi,
  updateConditionApi,
} from './api'
import { INITIAL_CONDITION } from './constants'
import {
  Condition,
  ConditionCategory,
  ConditionCreateArgs,
  ConditionDeleteArgs,
  ConditionFetchArgs,
  ConditionType,
  ConditionUpdateArgs,
  PrefetchedConditionData,
} from './types'

interface ConditionStore {
  isValid: boolean
  isSaved: boolean
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
      value: string | number | boolean | number[]
    ) => void
    setIsValidAction: (value: boolean) => void
    prefetchConditionDataAction: (type: ConditionType, address: string) => void
    resetPrefetchedConditionDataAction: () => void
    fetchConditionCategoriesAction: (
      type: ConditionType
    ) => Promise<ConditionCategory[] | undefined>
  }
}

const useConditionStore = create<ConditionStore & ConditionActions>((set) => ({
  isValid: false,
  isSaved: true,
  condition: INITIAL_CONDITION,
  prefetchedConditionData: null,
  actions: {
    setInitialConditionAction: (condition: Condition) => {
      set({ condition })
    },

    fetchConditionAction: async (args: ConditionFetchArgs) => {
      const { data, ok, error } = await fetchConditionApi(args)

      if (!ok) {
        throw new Error(error)
      }

      set({ condition: data })
    },

    fetchConditionCategoriesAction: async (type: ConditionType) => {
      if (
        type !== 'jetton' &&
        type !== 'nft_collection' &&
        type !== 'toncoin'
      ) {
        return
      }

      const { data, ok, error } = await fetchConditionCategoriesApi(type)

      if (!ok) {
        throw new Error(error)
      }

      return data
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

      set({ condition: null, isSaved: true })
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
        isSaved: false,
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
      const { data, ok, error } = await prefetchConditionDataApi(type, address)

      if (!ok) {
        throw new Error(error)
      }

      set({ prefetchedConditionData: data })
    },

    resetPrefetchedConditionDataAction: () => {
      set({ prefetchedConditionData: null })
    },
  },
}))

export const useConditionActions = () =>
  useConditionStore((state) => state.actions)
export const useCondition = createSelectors(useConditionStore)
