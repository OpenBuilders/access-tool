import {
  Emoji,
  Jettons,
  NFT,
  Premium,
  Gram,
  Whitelist,
  ExternalSource,
  Stickers,
  Gifts,
} from './components'

export const CONDITION_TYPES = [
  {
    value: 'jetton',
    name: 'Jetton',
  },
  {
    value: 'toncoin',
    name: 'Gram',
  },
  {
    value: 'nft_collection',
    name: 'NFT',
  },
  {
    value: 'sticker_collection',
    name: 'Stickers',
  },
  {
    value: 'gift_collection',
    name: 'Telegram Gifts',
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
    value: 'external_source',
    name: 'Custom API',
  },
]

export const CONDITION_COMPONENTS = {
  jetton: Jettons,
  nft_collection: NFT,
  whitelist: Whitelist,
  toncoin: Gram,
  premium: Premium,
  emoji: Emoji,
  external_source: ExternalSource,
  sticker_collection: Stickers,
  gift_collection: Gifts,
}
