import { Condition } from '@store'

export const validateJettonAddress = (address?: string): boolean => {
  if (!address) return false
  const addressRegex = /^0:[a-fA-F0-9]{64}$/
  return addressRegex.test(address)
}

export const validateAmount = (amount?: number | string): boolean => {
  if (!amount) return false
  return !isNaN(Number(amount)) && Number(amount) > 0
}

export const validateJettonsCondition = (condition: Condition) => {
  if (!condition) return false

  return (
    validateJettonAddress(condition.address || condition.blockchainAddress) &&
    validateAmount(condition?.expected)
  )
}
