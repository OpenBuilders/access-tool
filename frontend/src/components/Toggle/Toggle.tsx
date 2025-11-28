import { hapticFeedback } from '@utils'
import cn from 'classnames'

import styles from './Toggle.module.scss'

interface ToggleProps {
  isEnabled: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
  className?: string
  height?: number
  width?: number
  borderRadius?: number
}

export const Toggle = ({
  isEnabled = false,
  onChange,
  disabled = false,
  className,
  height = 30,
  width = 50,
  borderRadius = 34,
}: ToggleProps) => {
  const handleToggle = () => {
    if (disabled) return null
    hapticFeedback('soft')
    onChange(!isEnabled)
  }

  return (
    <div
      className={cn(styles.togglerContainer, className)}
      style={{ width, height }}
    >
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
        style={{ borderRadius }}
      >
        <span
          className={cn(
            styles.togglerThumb,
            isEnabled && styles.togglerThumbEnabled
          )}
          style={{
            borderRadius,
          }}
        />
      </button>
    </div>
  )
}
