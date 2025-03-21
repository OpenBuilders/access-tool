import {
  lockIcon,
  trashIcon,
  plusIcon,
  pixelBadge,
  dogsBadge,
  notcoinBadge,
  toncoinBadge,
} from './icons'
import { IconTypeName } from './types'

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
