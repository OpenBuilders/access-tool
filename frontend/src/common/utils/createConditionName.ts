import { Condition } from '@store'

import { separateNumber } from './separateNumber'

export const createConditionName = (condition: Condition) => {
  if (!condition) return ''
  const { type, expected, title } = condition

  if (type === 'jetton' || type === 'toncoin') {
    return `Hold ${separateNumber(expected)} ${title}`
  }

  if (type === 'emoji') {
    return 'Set Emoji Status'
  }

  if (type === 'nft_collection' || type === 'gift_collection') {
    return `Hold ${title}`
  }

  if (type === 'sticker_collection') {
    return `Hold ${condition.collection?.title} ${condition.character?.name} Stickers`
  }

  if (type === 'premium') {
    return 'Only for Telegram Premium'
  }

  if (type === 'whitelist') {
    return 'Be in the User List'
  }

  return title
}
