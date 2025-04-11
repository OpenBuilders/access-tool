export type Condition =
  | ConditionJetton
  | ConditionNFTCollection
  | ConditionWhitelistExternal
  | ConditionTGPremium
  | ConditionToncoin

export type ConditionType =
  | 'jetton'
  | 'nft_collections'
  | 'whitelist'
  | 'whitelist_external'
  | 'tg_premium'
  | 'toncoin'

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

export interface ConditionJetton {
  id: number
  type: 'jetton'
  title: string
  expected: number
  photoUrl: string
  blockchainAddress: string
  isEnabled: boolean
  asset: string
  category: string
  promoteUrl: string
  address?: string
}

export interface ConditionNFTCollection {
  id: number
  type: 'nft_collections'
  title: string
  expected: number
  photoUrl: string
  blockchainAddress: string
  isEnabled: boolean
  asset: string
  category: string
  promoteUrl: string
  address?: string
}

export interface ConditionToncoin {
  id: number
  type: 'toncoin'
  title: string
  expected: number
  photoUrl: string
  blockchainAddress: string
  isEnabled: boolean
  asset: string
  category: string
  promoteUrl: string
}

export interface ConditionWhitelist {
  id: number
  type: 'whitelist'
  chatId: number
  name: string
  description: string
  createdAt: string
  updatedAt: string
  isEnabled: boolean
  users: number[]
}

export interface ConditionWhitelistExternal {
  id: number
  type: 'whitelist_external'
  chatId: number
  name: string
  description: string
  createdAt: string
  updatedAt: string
  isEnabled: boolean
  blockchainAddress: string
  users: number[]
  url: string
}

export interface ConditionTGPremium {
  id: number
  type: string
  title: string
  expected: number
  photoUrl: string
  blockchainAddress: string
  isEnabled: boolean
  asset: string
  category: string
  promoteUrl: string
}

// export type ConditionCore = {
//   id: number
//   category: ConditionType
//   title: string
//   expected: number
//   photoUrl: string
//   blockchainAddress: string
//   isEnabled: boolean
//   promoteUrl: string
// }

// export type ConditionJetton = Partial<ConditionCore> & {
//   category: 'jetton'
//   address: string
// }

// export type ConditionNFTCollectionAttribute = {
//   traitType: string
//   value: string
// }

// export type ConditionNFTCollection = Partial<ConditionCore> & {
//   category: 'nft_collections'
//   address: string
//   requiredAttributes: ConditionNFTCollectionAttribute[]
// }

// export type ConditionWhitelistExternal = Partial<ConditionCore> & {
//   category: 'whitelist_external'
//   name: string
//   description: string
//   url?: string
//   users?: number[]
// }

export type PrefetchedConditionData = {
  address: string
  name: string
  description: string | null
  symbol: string
  logoPath: string
  isEnabled: boolean
  totalSupply: number
}
