import cn from 'classnames'
import React from 'react'

import styles from './ListToggler.module.scss'

interface ListTogglerProps {
  isEnabled: boolean
  onChange: (isEnabled: boolean) => void
  disabled?: boolean
  className?: string
}

export const ListToggler = ({
  isEnabled,
  onChange,
  disabled = false,
  className,
}: ListTogglerProps) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!isEnabled)
    }
  }

  return (
    <div className={cn(styles.togglerContainer, className)}>
      <button
        type="button"
        role="switch"
        aria-checked={isEnabled}
        className={cn(
          styles.toggler,
          isEnabled && styles.togglerEnabled,
          disabled && styles.togglerDisabled
        )}
        onClick={handleToggle}
        disabled={disabled}
      >
        <span
          className={cn(
            styles.togglerThumb,
            isEnabled && styles.togglerThumbEnabled
          )}
        />
      </button>
    </div>
  )
}
