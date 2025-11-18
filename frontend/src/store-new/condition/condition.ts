import { Condition } from '@types'
import { create } from 'zustand'

interface ConditionState {
  condition: Partial<Condition> | null
  isSaved: boolean
}

interface ConditionActions {
  actions: {
    setInitialConditionAction: (condition: Partial<Condition>) => void
    updateConditionAction: (condition: Partial<Condition>) => void
    toggleIsSavedAction: (value: boolean) => void
  }
}

const useConditionStore = create<ConditionState & ConditionActions>((set) => ({
  condition: null,
  isSaved: true,
  actions: {
    setInitialConditionAction: (condition) => {
      set({ condition, isSaved: true })
    },
    updateConditionAction: (condition) => {
      set({ condition, isSaved: false })
    },
    toggleIsSavedAction: (value) => {
      set({ isSaved: value })
    },
  },
}))

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
