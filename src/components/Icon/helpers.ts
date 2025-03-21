import {
  lockIcon,
  trashIcon,
  plusIcon,
  pixelBadge,
  dogsBadge,
  notcoinBadge,
  toncoinBadge,
} from './icons'

export type IconTypeName =
  | 'lock'
  | 'trash'
  | 'plus'
  | 'pixel'
  | 'dogs'
  | 'notcoin'
  | 'toncoin'

export const getIcon = (name: IconTypeName) => {
  switch (name) {
    case 'lock':
      return lockIcon
    case 'trash':
      return trashIcon
    case 'plus':
      return plusIcon
    case 'pixel':
      return pixelBadge
    case 'dogs':
      return dogsBadge
    case 'notcoin':
      return notcoinBadge
    case 'toncoin':
      return toncoinBadge
  }
}
