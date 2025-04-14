import { Jettons, NFT, Premium, Toncoin, Whitelist } from './components'

export const CONDITION_TYPES = [
  {
    value: 'jetton',
    name: 'Jetton',
  },
  {
    value: 'toncoin',
    name: 'Toncoin',
  },
  {
    value: 'nft_collection',
    name: 'NFT',
  },
  {
    value: 'whitelist',
    name: 'List of Users',
  },
  {
    value: 'premium',
    name: 'Telegram Premium',
  },
]

export const CONDITION_COMPONENTS = {
  jetton: Jettons,
  nft_collection: NFT,
  whitelist: Whitelist,
  toncoin: Toncoin,
  premium: Premium,
}
