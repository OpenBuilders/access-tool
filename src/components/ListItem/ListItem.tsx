import cn from 'classnames'

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
}

export const ListItem = ({
  text,
  children,
  description,
  before,
  after,
  chevron,
  onClick,
}: ListItemProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <div
      className={cn(styles.container, onClick && styles.clickable)}
      onClick={handleClick}
    >
      <div className={styles.left}>
        {before || null}
        <div className={styles.content}>
          <div>{text || null}</div>
          <div>{description || null}</div>
          {children || null}
        </div>
      </div>
      <div className={styles.right}>
        {after || null}
        {chevron && <Icon name="chevron" />}
      </div>
    </div>
  )
}
