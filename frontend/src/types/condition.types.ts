export enum ConditionType {
  JETTON = 'jetton',
  NFT_COLLECTION = 'nft_collection',
  GIFT_COLLECTION = 'gift_collection',
  EMOJI = 'emoji',
  EXTERNAL_SOURCE = 'external_source',
  TONCOIN = 'toncoin',
  PREMIUM = 'premium',
  WHITELIST = 'whitelist',
  STICKER_COLLECTION = 'sticker_collection',
}

// export type ConditionType =
//   | 'jetton'
//   | 'nft_collection'
//   | 'gift_collection'
//   | 'emoji'
//   | 'external_source'
//   | 'toncoin'
//   | 'premium'
//   | 'jetton'
//   | 'whitelist'
//   | 'sticker_collection'

export type ConditionCollection = {
  slug?: string
  title: string
  previewUrl?: string
  supply?: number
  upgradedCount?: number
  lastUpdated?: string
  id?: number
  logoUrl?: string
}

export type ConditionCharacter = {
  id: number
  logoUrl: string
  name: string
}

export type ConditionBase = {
  id: number
  groupId: number
  isEnabled: boolean
  createdAt: string
  updatedAt: string
  isEligible?: boolean
  actual?: number
}

export type ConditionJettons = ConditionBase & {
  type: ConditionType.JETTON
  title: string
  expected: number
  photoUrl: string
  blockchainAddress: string
  category: string
  promoteUrl: string
}

export type ConditionNftCollections = ConditionBase & {
  type: ConditionType.NFT_COLLECTION
  title: string
  expected: number
  photoUrl: string
  blockchainAddress: string
  category: string
  asset: string
  promoteUrl: string
}

export type ConditionToncoin = ConditionBase & {
  type: ConditionType.TONCOIN
  title: string
  expected: number
  photoUrl: string
  blockchainAddress: string
  category: string
  promoteUrl: string
}
export type ConditionPremium = ConditionBase & {
  type: ConditionType.PREMIUM
  title: string
  expected: number
  photoUrl: string
  blockchainAddress: string
  category: string
  promoteUrl: string
}

export type ConditionEmoji = ConditionBase & {
  type: ConditionType.EMOJI
  title: string
  expected: number
  photoUrl: string
  blockchainAddress: string
  category: string
  emojiId: string
  promoteUrl: string
}

export type ConditionStickers = ConditionBase & {
  type: ConditionType.STICKER_COLLECTION
  title: string
  expected: number
  photoUrl: string
  blockchainAddress: string
  category: string
  collection: {
    id: number
    title: string
    logo_url: string
  }
  character: {
    id: number
    name: string
    logo_url: string
  }
  promoteUrl: string
}

export type ConditionGifts = ConditionBase & {
  type: ConditionType.GIFT_COLLECTION
  title: string
  expected: number
  photoUrl: string
  blockchainAddress: string | null
  category: string
  collection: {
    slug: string
    title: string
    preview_url: string
    supply: number
    upgraded_count: number
    last_updated: string
  }
  model: string | null
  backdrop: string | null
  pattern: string | null
  promoteUrl: string
}

export type ConditionWhitelist = ConditionBase & {
  type: ConditionType.WHITELIST
  chatId: number
  name: string
  description: string
  users: number[]
}

export type ConditionExternalSource = ConditionBase & {
  type: ConditionType.EXTERNAL_SOURCE
  chatId: number
  name: string
  description: string
  users: number[]
  url: string
  authKey: string
  authValue: string
}

export type Condition = Partial<{
  id: number
  groupId: number
  asset: string
  type: ConditionType
  title: string
  expected: number
  photoUrl: string
  blockchainAddress: string
  isEnabled: boolean
  category: string | null
  actual: number
  isEligible: boolean
  promoteUrl: string
  backdrop: string | null
  model: string | null
  pattern: string | null
  collection: ConditionCollection | null
  emojiId: string | null
  character: ConditionCharacter | null
  chatId: number
  name: string
  description: string
  createdAt: string
  updatedAt: string
  users: number[]
  url: string
  authKey: string
  authValue: string
}>

export interface ConditionAPIArgs {
  type: ConditionType
  chatSlug?: string
  conditionId: string
  data?: Partial<Condition>
  address?: string
}

export type ConditionStickersCharacter = {
  id: number
  name: string
  logoUrl: string
}

export type ConditionStickersCollection = {
  id: number
  logoUrl: string
  title: string
  characters: ConditionStickersCharacter[]
}

export type ConditionJettonsToSend = {
  expected: number
  category: string
  groupId: number
  isEnabled: boolean
  address: string
}

export type ConditionNftCollectionToSend = {
  expected: number
  category: string
  groupId: number
  isEnabled: boolean
  address: string
  asset: string
}

export type ConditionToncoinToSend = {
  expected: number
  category: string
  groupId: number
  isEnabled: boolean
}

export type ConditionEmojiToSend = {
  isEnabled: boolean
  emojiId: string
  groupId: number
}

export type ConditionStickersToSend = {
  expected: number
  category: string
  groupId: number
  isEnabled: boolean
  collectionId: number
  characterId: number
}

export type ConditionGiftsToSend = {
  expected: number
  category: string
  groupId: number
  isEnabled: boolean
  collectionSlug: string
  model: string
  backdrop: string
  pattern: string
}

export type ConditionWhitelistToSend = {
  name: string
  description: string
  groupId: number
  users: number[]
  isEnabled: boolean
}

export type ConditionExternalSourceToSend = {
  name: string
  description: string
  groupId: number
  url: string
  authKey: string
  authValue: string
  isEnabled: boolean
}

export type ConditionPremiumToSend = {
  isEnabled: boolean
}

export type ConditionToSend =
  | ConditionJettonsToSend
  | ConditionNftCollectionToSend
  | ConditionToncoinToSend
  | ConditionEmojiToSend
  | ConditionGiftsToSend
  | ConditionWhitelistToSend
  | ConditionExternalSourceToSend
  | ConditionPremiumToSend
  | ConditionStickersToSend

export type ConditionCategory = {
  asset: string
  categories: string[]
}
