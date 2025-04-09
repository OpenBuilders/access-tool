import cn from 'classnames'
import { ReactNode, useEffect, useState } from 'react'

import styles from './Sheet.module.scss'

interface Sheet {
  onClose(): void
  opened?: boolean
  children?: ReactNode
}

export function Sheet({ children, opened, onClose }: Sheet) {
  const [isActiveState, setIsActiveState] = useState(false)

  useEffect(() => {
    if (opened) {
      setIsActiveState(true)
    }

    if (!opened) {
      setTimeout(() => {
        setIsActiveState(false)
      }, 300)
    }
  }, [opened])

  if (!isActiveState) return null

  return (
    <>
      <div
        className={cn(styles.root, opened && styles.rootActive)}
        onClick={onClose}
      ></div>

      <div className={cn(styles.sheet, opened && styles.sheetActive)}>
        <div className={styles.cross} onClick={onClose} />
        <div className={styles.content}>{children}</div>
      </div>
    </>
  )
}
