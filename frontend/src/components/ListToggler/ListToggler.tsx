import cn from 'classnames'

import styles from './ListToggler.module.scss'

const webApp = window.Telegram?.WebApp

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
      webApp?.HapticFeedback?.impactOccurred('soft')
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
