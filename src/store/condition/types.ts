export type Condition =
  | ConditionJetton
  | ConditionNFTCollection
  | ConditionWhitelistExternal

export type ConditionType =
  | 'jetton'
  | 'nft_collections'
  | 'whitelist'
  | 'whitelist_external'

export interface ConditionFetchArgs {
  type: ConditionType
  chatSlug: string
  conditionId: string
}

export interface ConditionUpdateArgs {
  type: ConditionType
  chatSlug: string
  conditionId: string
  data: Condition
}

export interface ConditionCreateArgs {
  type: ConditionType
  chatSlug: string
  data: Condition
}

export interface ConditionDeleteArgs {
  type: ConditionType
  chatSlug: string
  conditionId: string
}

export type ConditionCore = {
  id: number
  category: ConditionType
  title: string
  expected: number
  photoUrl: string
  blockchainAddress: string
  isEnabled: boolean
  promoteUrl: string
}

export type ConditionJetton = Partial<ConditionCore> & {
  category: 'jetton'
  address: string
}

export type ConditionNFTCollectionAttribute = {
  traitType: string
  value: string
}

export type ConditionNFTCollection = Partial<ConditionCore> & {
  category: 'nft_collections'
  address: string
  requiredAttributes: ConditionNFTCollectionAttribute[]
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

export type ConditionWhitelistExternal = Partial<ConditionCore> & {
  category: 'whitelist_external'
  name: string
  description: string
  url?: string
  users?: number[]
}
