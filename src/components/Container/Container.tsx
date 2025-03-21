import { List } from '@telegram-apps/telegram-ui'
import cn from 'classnames'

import styles from './Container.module.scss'
import { ContainerMarginType } from './types'

interface ContainerProps {
  children: React.ReactNode
  margin?: ContainerMarginType
}

export const Container = ({ children, margin }: ContainerProps) => {
  return (
    <List
      className={cn(styles.container, margin && styles[`margin-${margin}`])}
    >
      {children}
    </List>
  )
}
