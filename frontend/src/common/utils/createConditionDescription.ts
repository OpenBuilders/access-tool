import { Condition } from '@store'

export const createConditionDescription = (condition: Condition) => {
  const { type, category, expected, model, pattern, backdrop } = condition

  if (type === 'nft_collection') {
    const secondPart = category ? `, ${category}` : ''

    const countWord = Number(expected) > 1 ? 'Items' : 'Item'
    return `${expected} ${countWord}${secondPart}`.trim()
  }

  if (type === 'sticker_collection') {
    const secondPart = Number(expected) > 1 ? 'Items' : 'Item'
    return `${expected} ${secondPart}`.trim()
  }

  if (type === 'gift_collection') {
    const secondPart = Number(expected) > 1 ? 'Gifts' : 'Gift'
    const options = [model, backdrop, pattern].filter(Boolean).join(', ')
    return `${expected} ${secondPart}${options ? `, ${options}` : ''}`.trim()
  }

  return null
}
