import cn from 'classnames'
import React, { useEffect, useState } from 'react'

import { Block } from '../Block'
import { Text } from '../Text'
import styles from './DialogModal.module.scss'

interface DialogModalProps {
  active: boolean
  title: string
  description: string
  confirmText: string
  closeText: string
  onConfirm?: () => void
  onDelete?: () => void
  onClose: () => void
  children?: React.ReactNode
}

export const DialogModal = (props: DialogModalProps) => {
  const {
    active,
    title,
    description,
    confirmText,
    closeText,
    onConfirm,
    onClose,
    onDelete,
    children,
  } = props

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (active) {
      setIsOpen(true)
    } else {
      setTimeout(() => {
        setIsOpen(false)
      }, 500)
    }
  }, [active])

  if (!isOpen) return null

  const handleClick = onDelete ? onDelete : onConfirm

  return (
    <div className={cn(styles.dialogModal, active && styles.dialogModalActive)}>
      <div className={styles.dialogModalOverlay} onClick={onClose} />
      <div className={styles.dialogModalContent}>
        <div className={styles.dialogModalContentHeader}>
          <Block>
            <Text type="text" weight="medium" align="center">
              {title}
            </Text>
          </Block>
          <Block margin="top" marginValue={4}>
            <Text type="caption" color="primary" align="center">
              {description}
            </Text>
          </Block>
          {children && <Block margin="top" marginValue={16}>{children}</Block>}
        </div>
        <div className={styles.dialogModalContentFooter}>
          <div
            className={styles.dialogModalContentFooterButton}
            onClick={onClose}
          >
            <Text type="text" color="accent">
              {closeText}
            </Text>
          </div>
          <div
            className={styles.dialogModalContentFooterButton}
            onClick={handleClick}
          >
            <Text type="text" color={onDelete ? 'danger' : 'accent'}>
              {confirmText}
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}
