import { Text } from '@components'
import cn from 'classnames'
import React, { useLayoutEffect, useRef, useState } from 'react'

import styles from './Group.module.scss'

interface GroupProps {
  children: React.ReactNode
  header?: string
  footer?: React.ReactNode | string
  action?: React.ReactNode
}

export const Group = ({ children, header, footer, action }: GroupProps) => {
  const groupRef = useRef<HTMLDivElement>(null)
  const [groupItemsCount, setGroupItemsCount] = useState(0)

  useLayoutEffect(() => {
    if (groupRef.current) {
      const items = groupRef.current.querySelectorAll('[data-group-item]')
      setGroupItemsCount(items.length)
    }
  })

  const isOnlyOneChild = groupItemsCount === 1
  return (
    <>
      {header && (
        <div className={styles.header}>
          <div className={styles.headerText}>
            <Text type="caption" color="secondary" uppercase>
              {header}
            </Text>
          </div>
          {action && <div className={styles.action}>{action}</div>}
        </div>
      )}
      <div
        ref={groupRef}
        className={cn(styles.group, isOnlyOneChild && styles.groupOnlyOneChild)}
      >
        {children}
      </div>
      {footer && (
        <div className={styles.footer}>
          <Text type="caption" color="secondary">
            {footer}
          </Text>
        </div>
      )}
    </>
  )
}
