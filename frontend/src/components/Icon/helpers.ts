import {
  lockIcon,
  plusIcon,
  gatewayBot,
  doubleChevron,
  share,
  trash,
  check,
  cross,
  chevron,
  eyeCrossed,
  eye,
  connectWallet,
  toncoin,
  premium,
  whitelist,
  externalSource,
  emoji,
  jetton,
  nftCollection,
  stickers,
  gifts,
  checkUnable,
} from './icons'
import { IconTypeName } from './types'

export const getIcon = (name: IconTypeName) => {
  switch (name) {
    case 'lock':
      return lockIcon
    case 'trash':
      return trash
    case 'plus':
      return plusIcon
    case 'gatewayBot':
      return gatewayBot
    case 'doubleChevron':
      return doubleChevron
    case 'share':
      return share
    case 'check':
      return check
    case 'cross':
      return cross
    case 'chevron':
      return chevron
    case 'eyeCrossed':
      return eyeCrossed
    case 'eye':
      return eye
    case 'connectWallet':
      return connectWallet
    case 'toncoin':
      return toncoin
    case 'premium':
      return premium
    case 'whitelist':
      return whitelist
    case 'externalSource':
      return externalSource
    case 'emoji':
      return emoji
    case 'jetton':
      return jetton
    case 'nftCollection':
      return nftCollection
    case 'stickers':
      return stickers
    case 'gifts':
      return gifts
    case 'checkUnable':
      return checkUnable
  }
}
