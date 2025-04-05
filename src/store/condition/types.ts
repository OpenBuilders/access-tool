export type Condition = ConditionJetton

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

export type ConditionJetton = ConditionCore & {
  category: 'jetton'
}

export type ConditionNFTCollectionAttribute = {
  traitType: string
  value: string
}

export type ConditionNFTCollection = ConditionCore & {
  category: 'nft_collection'
  requiredAttributes: ConditionNFTCollectionAttribute[]
}
