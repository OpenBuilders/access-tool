import { lockIcon } from './icons'

export type IconTypeName = 'lock'

export const getIcon = (name: IconTypeName) => {
  switch (name) {
    case 'lock':
      return lockIcon
    default:
      return null
  }
}
