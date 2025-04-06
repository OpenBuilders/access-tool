export type Condition = ConditionJetton | ConditionNFTCollection

export type ConditionCategory = 'jetton' | 'nft_collection'

export type ConditionCore = {
  id: number
  category: ConditionCategory
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
  amount: number
}

export type ConditionNFTCollectionAttribute = {
  traitType: string
  value: string
}

export type ConditionNFTCollection = Partial<ConditionCore> & {
  category: 'nft_collection'
  requiredAttributes: ConditionNFTCollectionAttribute[]
}

export type PrefetchJetton = {
  address: string
  name: string
  description: string | null
  symbol: string
  logoPath: string
  isEnabled: boolean
  totalSupply: number
}
