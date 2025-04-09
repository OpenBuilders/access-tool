import { List } from '@telegram-apps/telegram-ui'
import cn from 'classnames'

import styles from './Container.module.scss'
import { ContainerMarginType } from './types'

interface ContainerProps {
  children: React.ReactNode
  className?: string
}

export const Container = ({ children, className }: ContainerProps) => {
  return (
    <List className={cn(styles.container, className || '')}>{children}</List>
  )
}
