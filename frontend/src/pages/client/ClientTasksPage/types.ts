import { Condition } from '@store'

export interface FormattedConditions {
  whitelist: Condition[]
  notAvailable: Condition[]
  available: Condition[]
  notNeeded: Condition[]
}
