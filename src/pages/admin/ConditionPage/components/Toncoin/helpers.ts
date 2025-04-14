import { Condition } from '@store'

export const validateAmount = (amount?: number): boolean => {
  if (!amount) return false
  return !isNaN(amount) && amount > 0
}

export const validateToncoinCondition = (condition: Condition) => {
  if (!condition) return false

  return validateAmount(condition?.expected)
}
