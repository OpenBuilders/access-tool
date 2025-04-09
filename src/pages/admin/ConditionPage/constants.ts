import { Jettons, NFT, WhitelistExternal } from './components'

export const CONDITION_TYPES = [
  {
    value: 'jetton',
    name: 'Jetton',
  },
  {
    value: 'nft_collections',
    name: 'NFT',
  },
  // {
  //   value: 'whitelist',
  //   name: 'Whitelist',
  // },
  {
    value: 'whitelist_external',
    name: 'List of Users',
  },
]

export const CONDITION_COMPONENTS = {
  jetton: Jettons,
  nft_collections: NFT,
  whitelist_external: WhitelistExternal,
}
