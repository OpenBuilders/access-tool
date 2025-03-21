import cn from 'classnames'

import styles from './Icon.module.scss'
import { getIcon, IconTypeName } from './helpers'

interface IconProps {
  name: IconTypeName
  size: 112
}

export const Icon = ({ name, size }: IconProps) => {
  const IconName = getIcon(name as IconTypeName)

  if (!IconName) return null

  return (
    <div className={cn(styles.icon, styles[`size-${size}`])}>{IconName}</div>
  )
}
