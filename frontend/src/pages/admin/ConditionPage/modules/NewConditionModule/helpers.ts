import { Condition } from '@store'

export const createUpdatedData = (condition: Condition) => {
  if (!condition) return null

  console.log('🚀 ~ createUpdatedData ~ condition:', condition)

  if (condition.type === 'jetton') {
    return {
      name: condition.name,
      asset: condition.asset,
      address: condition.address,
      expected: condition.expected,
      category: condition.category,
    }
  }

  if (condition.type === 'nft_collection') {
    return {
      address: condition.address,
      expected: condition.expected,
      category: condition.category,
    }
  }

  if (condition.type === 'whitelist') {
    return {
      users: condition.users,
      name: condition.name,
      description: condition.description,
    }
  }

  if (condition.type === 'toncoin') {
    return {
      expected: condition.expected,
      category: condition.category,
    }
  }

  if (condition.type === 'premium') {
    return {
      isEnabled: condition.isEnabled,
    }
  }

  return condition
}
