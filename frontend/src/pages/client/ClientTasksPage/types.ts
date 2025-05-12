import { Condition } from '@store'

export interface FormattedConditions {
  whitelist: Condition[]
  orRequired: Condition[]
  available: Condition[]
  notNeeded: Condition[]
}
