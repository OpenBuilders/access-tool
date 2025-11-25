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

  useLayoutEffect(() => {
    if (groupRef.current) {
      const items = groupRef.current.querySelectorAll(
        '[data-group-item-border-bottom]'
      )

      // Сначала сбрасываем opacity для всех элементов
      items.forEach((item) => {
        if (item instanceof HTMLElement) {
          item.style.opacity = '1'
        }
      })

      // Затем скрываем последний элемент
      if (items.length > 0) {
        const lastItem = items[items.length - 1]
        if (lastItem instanceof HTMLElement) {
          lastItem.style.opacity = '0'
        }
      }
    }
  }, [children]) // Добавляем children в зависимости

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
      <div ref={groupRef} className={styles.group}>
        {children}
      </div>
      {footer && (
        <div className={styles.footer}>
          <Text type="caption" color="secondary" as="div">
            {footer}
          </Text>
        </div>
      )}
    </>
  )
}
