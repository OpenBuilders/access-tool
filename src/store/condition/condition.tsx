import { create } from 'zustand'

import { createSelectors } from '../types'
import {
  createConditionJettonApi,
  createConditionNFTCollectionApi,
  deleteConditionJettonApi,
  fetchConditionJettonApi,
  prefetchJettonsApi,
  prefetchNFTCollectionsApi,
} from './api'
import {
  Condition,
  ConditionJetton,
  ConditionNFTCollection,
  PrefetchJetton,
  PrefetchNFTCollection,
} from './types'

interface ConditionStore {
  isValid: boolean
  condition: Condition | null
}

interface ConditionActions {
  actions: {
    setInitialConditionAction: (condition: Condition) => void
    // Jetton Actions
    fetchConditionJettonAction: (chatSlug: string, conditionId: string) => void
    createConditionJettonAction: (chatSlug: string) => void
    deleteConditionJettonAction: (chatSlug: string, conditionId: string) => void
    // NFT Collection Actions
    createConditionNFTCollectionAction: (chatSlug: string) => void
    // Common Actions
    handleChangeConditionFieldAction: (
      field: string,
      value: string | number
    ) => void
    setIsValidAction: (value: boolean) => void
    prefetchNFTCollectionAction: (
      address: string
    ) => Promise<PrefetchNFTCollection | undefined>
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

      fetchConditionJettonAction: async (
        chatSlug: string,
        conditionId: string
      ) => {
        const { data, ok, error } = await fetchConditionJettonApi(
          chatSlug,
          conditionId
        )

        if (!ok) {
          throw new Error(error)
        }

        set({ condition: data as ConditionJetton })
      },

      deleteConditionJettonAction: async (
        chatSlug: string,
        conditionId: string
      ) => {
        const { ok, error } = await deleteConditionJettonApi(
          chatSlug,
          conditionId
        )

        if (!ok) {
          throw new Error(error)
        }

        set({ condition: null })
      },
      createConditionJettonAction: async (chatSlug: string) => {
        const { ok, error } = await createConditionJettonApi(
          chatSlug,
          get().condition as ConditionJetton
        )

        if (!ok) {
          throw new Error(error)
        }
      },

      createConditionNFTCollectionAction: async (chatSlug: string) => {
        const { ok, error } = await createConditionNFTCollectionApi(
          chatSlug,
          get().condition as ConditionNFTCollection
        )

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
        const { data, ok, error } = await prefetchJettonsApi(address)

        if (!ok) {
          throw new Error(error)
        }

        return data
      },
      prefetchNFTCollectionAction: async (address) => {
        const { data, ok, error } = await prefetchNFTCollectionsApi(address)

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
