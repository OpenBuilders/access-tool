import { Condition } from '@store'

export const createConditionDescription = (condition: Condition) => {
  const { type, category, expected, model, pattern, backdrop } = condition

  if (type === 'nft_collection') {
    const secondPart = category
      ? category
      : Number(expected) > 1
        ? 'Items'
        : 'Item'
    return `${expected} ${secondPart}`.trim()
  }

  if (type === 'sticker_collection') {
    const secondPart = Number(expected) > 1 ? 'Items' : 'Item'
    return `${expected} ${secondPart}`.trim()
  }

  if (type === 'gift_collection') {
    const secondPart = Number(expected) > 1 ? 'Gifts' : 'Gift'
    const options = [model, pattern, backdrop].filter(Boolean).join(', ')
    return `${expected} ${secondPart}${options ? `, ${options}` : ''}`.trim()
  }

  return null
}
