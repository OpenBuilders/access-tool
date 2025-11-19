import { Condition, ConditionToSend, ConditionType } from '@types'
import { create } from 'zustand'

import { CONDITION_INITIAL_STATE } from './constants'
import { transformConditionToSend } from './transformers'

interface ConditionState {
  conditionType: ConditionType
  condition: Partial<ConditionToSend>
  isSaved: boolean
}

interface ConditionActions {
  actions: {
    setConditionTypeAction: (conditionType: ConditionType) => void
    setInitialConditionAction: (condition?: Partial<Condition>) => void
    updateConditionAction: (condition: Partial<ConditionToSend>) => void
    toggleIsSavedAction: (value: boolean) => void
    cleanConditionAction: () => void
  }
}

const useConditionStore = create<ConditionState & ConditionActions>(
  (set, get) => ({
    conditionType: ConditionType.JETTON,
    condition: CONDITION_INITIAL_STATE,
    isSaved: true,
    actions: {
      setConditionTypeAction: (conditionType) => {
        get().actions.cleanConditionAction()
        set({ conditionType })
      },
      setInitialConditionAction: (condition) => {
        set({
          condition: transformConditionToSend(get().conditionType, condition),
          isSaved: true,
        })
      },
      updateConditionAction: (condition) => {
        set({
          condition: transformConditionToSend(get().conditionType, condition),
          isSaved: false,
        })
      },
      toggleIsSavedAction: (value) => {
        set({ isSaved: value })
      },
      cleanConditionAction: () => {
        set({
          condition: transformConditionToSend(get().conditionType),
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
export const useConditionType = createSheetFieldHook('conditionType')

// Actions
export const useConditionActions = () => useConditionStore(selectActions)
