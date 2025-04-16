import classNames from 'classnames'
import { ReactNode } from 'react'

import styles from './Button.module.scss'

interface ButtonProps {
  children?: React.ReactNode
  disabled?: boolean
  prefix?: ReactNode
  onClick?(): void
  type?:
    | 'basic'
    | 'danger'
    | 'primary'
    | 'secondary'
    | 'link'
    | 'primary-gradient'
    | 'accent'
}

export const Button = ({
  children,
  onClick,
  disabled,
  prefix,
  type = 'basic',
}: ButtonProps) => {
  return (
    <div
      className={classNames(
        styles.root,
        styles[`type-${type}`],
        disabled && styles.disabled,
        !disabled && styles.ripple
      )}
      onClick={() => {
        if (!disabled && onClick) {
          onClick()
        }
      }}
    >
      {prefix ? <div className={styles.prefix}>{prefix}</div> : null}
      {children}
    </div>
  )
}
