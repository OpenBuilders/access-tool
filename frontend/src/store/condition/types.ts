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
export interface Condition {
  id: number
  type: ConditionType
  title: string
  expected: number | string
  photoUrl: string
  blockchainAddress?: string
  isEnabled: boolean
  asset: string
  category?: string
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
