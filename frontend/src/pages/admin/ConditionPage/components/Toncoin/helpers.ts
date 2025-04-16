import { Condition } from '@store'

export const validateAmount = (amount?: number | string): boolean => {
  if (!amount) return false
  return !isNaN(Number(amount)) && Number(amount) > 0
}

export const validateToncoinCondition = (condition: Condition) => {
  if (!condition) return false

  return validateAmount(condition?.expected)
}
