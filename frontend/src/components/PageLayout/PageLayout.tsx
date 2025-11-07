import { checkIsMobile } from '@utils'
import cn from 'classnames'
import { PropsWithChildren } from 'react'

import styles from './PageLayout.module.scss'

interface PageLayoutProps extends PropsWithChildren {
  onScroll?: (event: any) => void
  center?: boolean
}

export const PageLayout = (props: PageLayoutProps) => {
  const { children, onScroll, center } = props

  const { isMobile } = checkIsMobile()

  return (
    <div
      onScroll={(e) => onScroll?.(e)}
      id="page-layout"
      className={cn(
        styles.root,
        isMobile && styles.isMobile,
        center && styles.center
      )}
    >
      {children}
    </div>
  )
}
