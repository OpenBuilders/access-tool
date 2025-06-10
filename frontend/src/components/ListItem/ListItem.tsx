import { ThemeContext } from '@context'
import cn from 'classnames'
import { useContext } from 'react'

import { Icon } from '../Icon'
import styles from './ListItem.module.scss'

interface ListItemProps {
  text?: React.ReactNode
  children?: React.ReactNode
  description?: React.ReactNode
  before?: React.ReactNode
  after?: React.ReactNode
  chevron?: boolean
  onClick?: () => void
  disabled?: boolean
  padding?: string
  height?: string
  showCheck?: boolean
  isCompleted?: boolean
}

export const ListItem = ({
  text,
  children,
  description,
  before,
  after,
  chevron,
  disabled,
  onClick,
  padding,
  height,
  showCheck,
  isCompleted,
}: ListItemProps) => {
  const { darkTheme } = useContext(ThemeContext)
  const handleClick = () => {
    if (onClick && !disabled) {
      onClick()
    }
  }

  const isDarkTheme = darkTheme

  return (
    <div
      className={cn(
        styles.container,
        onClick && styles.clickable,
        disabled && styles.disabled
      )}
      style={{ padding: padding || '10px 16px', height: height || undefined }}
      onClick={handleClick}
    >
      <div className={styles.left}>
        {showCheck && (
          <Icon name={isCompleted ? 'check' : 'checkUnable'} size={24} />
        )}
        {before || null}
        <div className={styles.content}>
          {text && <div>{text}</div>}
          {description && <div>{description}</div>}
          {children && children}
        </div>
      </div>
      <div className={styles.right}>
        {after || null}
        {chevron && (
          <div className={cn(styles.chevron, isDarkTheme && styles.dark)}>
            <Icon name="chevron" />
          </div>
        )}
      </div>
    </div>
  )
}
