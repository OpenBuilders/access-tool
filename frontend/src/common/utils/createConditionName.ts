import { Condition } from '@store'

import { separateNumber } from './separateNumber'

export const createConditionName = (condition: Condition) => {
  if (!condition) return ''
  const { type, expected, title } = condition

  if (type === 'jetton') {
    return `Hold ${separateNumber(expected)} ${title}`
  }

  if (type === 'emoji') {
    return 'Emoji Status'
  }

  if (type === 'nft_collection') {
    return `Hold ${title}`
  }

  if (type === 'premium') {
    return 'Only for Telegram Premium'
  }

  if (type === 'whitelist') {
    return 'Be in the User List'
  }

  if (type === 'toncoin') {
    return `Hold ${separateNumber(expected)} ${title}`
  }

  if (type === 'sticker_collection') {
    return `Stickers ${title}`
  }

  return title
}
