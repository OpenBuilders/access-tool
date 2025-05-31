import cn from 'classnames'

import styles from './Icon.module.scss'
import { getIcon } from './helpers'
import { IconSize, IconTypeName } from './types'

interface IconProps {
  name: IconTypeName
  size?: IconSize
  color?: 'danger' | 'tertiary' | 'secondary' | 'accent'
  className?: string
}

export const Icon = ({ name, size, color, className }: IconProps) => {
  const IconName = getIcon(name)

  if (!IconName) return null

  return (
    <div
      className={cn(
        styles.icon,
        size && styles[`size-${size}`],
        color && styles[`color-${color}`],
        className
      )}
    >
      {IconName}
    </div>
  )
}
