import { ConditionToSend, ConditionType } from '@types'

export const CONDITION_INITIAL_STATE: Record<ConditionType, ConditionToSend> = {
  jetton: {
    expected: 0,
    category: '',
    groupId: 0,
    isEnabled: true,
    address: '',
  },
  nft_collection: {
    expected: 0,
    category: '',
    groupId: 0,
    isEnabled: true,
    asset: '',
  },
  toncoin: {
    expected: 0,
    category: '',
    groupId: 0,
    isEnabled: true,
  },
  emoji: {
    isEnabled: true,
    emojiId: '',
    groupId: 0,
  },
  sticker_collection: {
    expected: 0,
    category: '',
    groupId: 0,
    isEnabled: true,
    collectionId: 0,
    characterId: 0,
  },
  gift_collection: {
    expected: 0,
    category: '',
    groupId: 0,
    isEnabled: true,
    collectionSlug: '',
    model: '',
    backdrop: '',
    pattern: '',
  },
  whitelist: {
    name: '',
    description: '',
    groupId: 0,
    users: [],
    isEnabled: true,
  },
  external_source: {
    name: '',
    description: '',
    groupId: 0,
    url: '',
    authKey: '',
    authValue: '',
    isEnabled: true,
  },
  premium: {
    isEnabled: true,
  },
}
