import { ConditionJetton, ConditionNFTCollection } from './types'

export const INITIAL_CONDITION_JETTON: ConditionJetton = {
  category: 'jetton',
  address: '',
  amount: 0,
}

export const INITIAL_CONDITION_NFT_COLLECTION: ConditionNFTCollection = {
  category: 'nft_collection',
  address: '',
  amount: 0,
  requiredAttributes: [],
}
