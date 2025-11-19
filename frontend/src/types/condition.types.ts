export type ConditionType =
  | 'jetton'
  | 'nft_collection'
  | 'gift_collection'
  | 'emoji'
  | 'external_source'
  | 'toncoin'
  | 'premium'
  | 'jetton'
  | 'whitelist'
  | 'sticker_collection'

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

export type Condition = {
  id: number
  groupId: number
  asset?: string
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
  backdrop?: string | null
  model?: string | null
  pattern?: string | null
  collection?: ConditionCollection | null
  emojiId?: string | null
  character?: ConditionCharacter | null
}

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
