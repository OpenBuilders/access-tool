import { Condition } from '@store'

interface Result {
  notAvailable: Condition[]
  available: Condition[]
}

export const sortConditions = (
  conditions: Condition[] | null,
  walletAddress?: string
) => {
  if (!conditions) return { notAvailable: [], available: [] }

  const result: Result = {
    notAvailable: [],
    available: [],
  }

  //   if (!walletAddress) {
  result.available = conditions
  return result
  //   }
}
