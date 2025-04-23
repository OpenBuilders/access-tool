import {
  Emoji,
  Jettons,
  NFT,
  Premium,
  Toncoin,
  Whitelist,
  WhitelistExternal,
} from './components'

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
  {
    value: 'emoji',
    name: 'Emoji Status',
  },
  {
    value: 'whitelist_external',
    name: 'Custom API',
  },
]

export const CONDITION_COMPONENTS = {
  jetton: Jettons,
  nft_collection: NFT,
  whitelist: Whitelist,
  toncoin: Toncoin,
  premium: Premium,
  emoji: Emoji,
  whitelist_external: WhitelistExternal,
}
