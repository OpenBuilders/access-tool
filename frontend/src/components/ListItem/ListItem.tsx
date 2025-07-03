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
      style={{
        padding: padding || '10px 16px',
        minHeight: height || undefined,
      }}
      onClick={handleClick}
    >
      <div className={styles.left}>
        {before || null}
        <div className={styles.content}>
          {text && <div>{text}</div>}
          {description && <div>{description}</div>}
          {children && children}
        </div>
      </div>
      <div className={styles.right}>
        {after || null}
        {chevron && !isCompleted && (
          <div className={cn(styles.chevron, isDarkTheme && styles.dark)}>
            <Icon name="chevron" />
          </div>
        )}
        {isCompleted && <Icon name="completed" size={24} />}
      </div>
    </div>
  )
}
