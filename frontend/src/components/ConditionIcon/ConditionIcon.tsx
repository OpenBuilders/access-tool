import { Icon } from '@components'
import { Condition } from '@types'
import cn from 'classnames'

import { IconTypeName } from '../Icon/types'
import styles from './ConditionIcon.module.scss'

interface ConditionIconProps {
  condition?: Condition
  walletCondition?: boolean
}

const ICONS = {
  toncoin: 'toncoin',
  'connect-wallet': 'connectWallet',
  premium: 'premium',
  whitelist: 'whitelist',
  external_source: 'externalSource',
  emoji: 'emoji',
  jetton: 'jetton',
  nft_collection: 'nftCollection',
  sticker_collection: 'stickers',
  gift_collection: 'gifts',
}

export const ConditionIcon = ({
  condition,
  walletCondition,
}: ConditionIconProps) => {
  if (walletCondition) {
    return <Icon name="connectWallet" className={styles.rounded} size={40} />
  }

  const { type, photoUrl, character } = condition || {}

  if (
    (type === 'jetton' ||
      type === 'nft_collection' ||
      type === 'gift_collection') &&
    photoUrl
  ) {
    const needRounded = type !== 'gift_collection' && type !== 'nft_collection'
    return (
      <img
        src={photoUrl}
        className={cn(styles.image, needRounded ? styles.rounded : '')}
      />
    )
  }

  if (type === 'sticker_collection' && photoUrl) {
    return (
      <img
        src={character?.logo_url || photoUrl}
        className={cn(styles.image, styles.rounded)}
      />
    )
  }

  const iconName = ICONS[type as keyof typeof ICONS]

  if (iconName) {
    return (
      <Icon
        name={iconName as IconTypeName}
        className={styles.rounded}
        size={40}
      />
    )
  }

  return null
}
