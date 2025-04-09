import { ChatRule } from '@store'

interface Result {
  notAvailable: ChatRule[]
  available: ChatRule[]
}

export const sortConditions = (
  conditions: ChatRule[] | null,
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
