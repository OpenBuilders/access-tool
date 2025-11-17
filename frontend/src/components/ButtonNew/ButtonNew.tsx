import classNames from 'classnames'
import { ReactNode, useCallback } from 'react'

import styles from './ButtonNew.module.scss'

interface ButtonNewProps {
  text?: string
  disabled?: boolean
  icon?: ReactNode
  onClick?(): void
  type?: 'primary' | 'secondary'
}

export const ButtonNew = ({
  text,
  onClick,
  disabled,
  icon,
  type = 'primary',
}: ButtonNewProps) => {
  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      onClick()
    }
  }, [disabled, onClick])
  return (
    <button
      className={classNames(styles.button, styles[`type-${type}`])}
      onClick={handleClick}
      disabled={disabled}
    >
      {icon && icon}
      {text}
    </button>
  )
}
