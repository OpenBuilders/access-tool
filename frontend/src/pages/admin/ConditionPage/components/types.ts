import { Condition } from '@store'

export interface ConditionComponentProps {
  isNewCondition?: boolean
  handleChangeCondition: (
    key: keyof Condition,
    value: string | number | number[] | undefined | boolean | null
  ) => void
  conditionState: Partial<Condition>
  setInitialState: (value: Partial<Condition>) => void
  condition?: Condition
}
