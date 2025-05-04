export interface ConditionNFTCollectionAttribute {
  traitType: string
  value: string
}

export type ConditionType =
  | 'jetton'
  | 'nft_collection'
  | 'whitelist'
  | 'external_source'
  | 'premium'
  | 'toncoin'
  | 'emoji'
  | 'sticker_collection'
export interface Condition {
  id: number
  type: ConditionType
  title: string
  expected: number | string
  photoUrl: string
  blockchainAddress?: string
  isEnabled: boolean
  asset: string
  category?: string | null
  promoteUrl: string
  address?: string
  requiredAttributes?: ConditionNFTCollectionAttribute[]
  users?: number[]
  name?: string
  description?: string
  isEligible?: boolean
  actual?: number
  url?: string
  emojiId?: string
  authKey?: string
  authValue?: string
  collectionId?: number | string | null
  characterId?: number | string | null
  collection?: StickersCollection | null
  character?: StickersCharacter | null
}

export interface PrefetchedConditionData {
  address: string
  name: string
  description: string | null
  symbol: string
  logoPath: string
  isEnabled: boolean
  totalSupply: number
}

export interface ConditionCategory {
  asset: string
  categories: string[]
}

export interface ConditionFetchArgs {
  type: ConditionType
  chatSlug: string
  conditionId: string
}

export interface ConditionUpdateArgs {
  type: ConditionType
  chatSlug: string
  conditionId: string
  data: Partial<Condition>
}

export interface ConditionCreateArgs {
  type: ConditionType
  chatSlug: string
  data: Partial<Condition>
}

export interface ConditionDeleteArgs {
  type: ConditionType
  chatSlug: string
  conditionId: string
}

export interface StickersCharacter {
  id: number
  name: string
  logoUrl: string | null
}

export interface StickersCollection {
  id: number
  logoUrl: string | null
  title: string
  characters: StickersCharacter[]
}
