import { Condition } from '@store'

const ASSETS_WITH_DESCRIPTION = [
  'Telegram Usernames',
  'Telegram Numbers',
  'TON DNS',
]

export const createConditionDescription = (condition: Condition) => {
  const { type, category, asset } = condition

  if (
    type === 'nft_collection' &&
    ASSETS_WITH_DESCRIPTION.includes(asset || '')
  ) {
    return category
  }

  return null
}
