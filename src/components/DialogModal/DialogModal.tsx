import cs from '@styles/commonStyles.module.scss'
import { Caption, Text } from '@telegram-apps/telegram-ui'
import cn from 'classnames'
import { useEffect, useState } from 'react'

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
          <div className={cs.textCenter}>
            <Text weight="2">{title}</Text>
          </div>
          <div className={cn(cs.mt4, cs.textCenter)}>
            <Caption>{description}</Caption>
          </div>
        </div>
        <div className={styles.dialogModalContentFooter}>
          <div
            className={cn(styles.dialogModalContentFooterButton, cs.colorLink)}
            onClick={onClose}
          >
            <Text>{closeText}</Text>
          </div>
          <div
            className={cn(
              styles.dialogModalContentFooterButton,
              onDelete ? cs.colorDanger : cs.colorLink
            )}
            onClick={handleClick}
          >
            <Text>{confirmText}</Text>
          </div>
        </div>
      </div>
    </div>
  )
}
