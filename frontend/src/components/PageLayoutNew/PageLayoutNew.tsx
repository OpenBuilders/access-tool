import { checkIsMobile } from '@utils'
import cn from 'classnames'
import { PropsWithChildren } from 'react'

import styles from './PageLayoutNew.module.scss'

interface PageLayoutNewProps extends PropsWithChildren {
  onScroll?: (event: any) => void
  center?: boolean
  safeContent?: boolean
}

export const PageLayoutNew = (props: PageLayoutNewProps) => {
  const { children, onScroll, center, safeContent } = props

  const { isMobile } = checkIsMobile()

  return (
    <div
      onScroll={(e) => onScroll?.(e)}
      id="page-layout"
      className={cn(
        styles.root,
        isMobile && styles.isMobile,
        center && styles.center,
        safeContent && styles.safeContent
      )}
    >
      {children}
    </div>
  )
}
