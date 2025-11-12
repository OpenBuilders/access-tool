import cn from 'classnames'

import styles from './PageLayout.module.scss'

interface PageLayoutProps {
  children: React.ReactNode
  center?: boolean
}

export const PageLayout = ({ children, center = false }: PageLayoutProps) => {
  return (
    <div className={cn(styles.root, center && styles.center)}>{children}</div>
  )
}
