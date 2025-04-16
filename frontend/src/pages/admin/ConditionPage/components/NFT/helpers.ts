import { Condition } from '@store'

export const validateNFTCollectionAddress = (address?: string): boolean => {
  if (!address) return false
  const addressRegex = /^0:[a-fA-F0-9]{64}$/
  return addressRegex.test(address)
}

export const validateAmount = (amount?: number | string): boolean => {
  if (!amount) return false
  return !isNaN(Number(amount)) && Number(amount) > 0
}

export const validateNFTCollectionCondition = (condition: Condition) => {
  if (!condition) return false

  if (condition.asset !== 'Any') {
    return validateAmount(condition?.expected)
  }

  return (
    validateNFTCollectionAddress(condition.address) &&
    validateAmount(condition?.expected)
  )
}
