import { ConditionMutated } from '@types'
import { create } from 'zustand'

import { CONDITION_INITIAL_STATE } from './constants'

interface ConditionState {
  condition: ConditionMutated
  isSaved: boolean
}

interface ConditionActions {
  actions: {
    updateConditionAction: (condition: any) => void
    toggleIsSavedAction: (value: boolean) => void
    cleanConditionAction: () => void
  }
}

const useConditionStore = create<ConditionState & ConditionActions>(
  (set, get) => ({
    condition: CONDITION_INITIAL_STATE,
    isSaved: true,
    actions: {
      updateConditionAction: (condition) => {
        set({
          condition: {
            ...get().condition,
            ...condition,
          },
          isSaved: false,
        })
      },
      toggleIsSavedAction: (value) => {
        set({ isSaved: value })
      },
      cleanConditionAction: () => {
        set({
          condition: CONDITION_INITIAL_STATE,
          isSaved: true,
        })
      },
    },
  })
)

const selectActions = (s: ConditionActions) => s.actions

const createSheetFieldHook =
  <K extends keyof ConditionState>(key: K) =>
  () =>
    useConditionStore((s) => s[key] as ConditionState[K])

// State
export const useCondition = createSheetFieldHook('condition')
export const useIsSaved = createSheetFieldHook('isSaved')

// Actions
export const useConditionActions = () => useConditionStore(selectActions)
