import cn from 'classnames'

import styles from './Icon.module.scss'
import { getIcon } from './helpers'
import { IconSize, IconTypeName } from './types'

interface IconProps {
  name: IconTypeName
  size: IconSize
}

export const Icon = ({ name, size }: IconProps) => {
  const IconName = getIcon(name)

  if (!IconName) return null

  return (
    <div className={cn(styles.icon, styles[`size-${size}`])}>{IconName}</div>
  )
}
