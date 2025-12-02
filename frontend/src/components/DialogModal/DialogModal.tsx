import cn from 'classnames'
import { useEffect, useState } from 'react'

import { Block } from '../Block'
import { BlockNew } from '../BlockNew'
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
          <BlockNew>
            <Text type="text" weight="medium" align="center">
              {title}
            </Text>
          </BlockNew>
          <BlockNew padding="4px 0 0 0">
            <Text type="caption" color="primary" align="center">
              {description}
            </Text>
          </BlockNew>
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
