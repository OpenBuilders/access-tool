export interface ConditionNFTCollectionAttribute {
  traitType: string
  value: string
}

export type ConditionType =
  | 'jetton'
  | 'nft_collection'
  | 'whitelist'
  | 'whitelist_external'
  | 'premium'
  | 'toncoin'

export type Condition = {
  id: number
  type: ConditionType
  title: string
  expected: number
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
}

export type PrefetchedConditionData = {
  address: string
  name: string
  description: string | null
  symbol: string
  logoPath: string
  isEnabled: boolean
  totalSupply: number
}

export type ConditionCategory = {
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
