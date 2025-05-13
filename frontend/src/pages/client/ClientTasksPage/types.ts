import { Condition } from '@store'

export interface FormattedConditions {
  whitelist: Condition[]
  externalSource: Condition[]
  orRequired: Condition[]
  available: Condition[]
  notNeeded: Condition[]
}
