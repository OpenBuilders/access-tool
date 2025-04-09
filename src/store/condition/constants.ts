import {
  ConditionJetton,
  ConditionNFTCollection,
  ConditionWhitelistExternal,
} from './types'

export const INITIAL_CONDITION_JETTON: ConditionJetton = {
  category: 'jetton',
  address: '',
  expected: 0,
}

export const INITIAL_CONDITION_NFT_COLLECTION: ConditionNFTCollection = {
  category: 'nft_collections',
  address: '',
  expected: 0,
  requiredAttributes: [],
}

export const INITIAL_CONDITION_WHITELIST_EXTERNAL: ConditionWhitelistExternal =
  {
    category: 'whitelist_external',
    name: '',
    description: '',
    url: '',
    users: [],
  }
