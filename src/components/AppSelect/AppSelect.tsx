import { Icon } from '../Icon'
import styles from './AppSelect.module.scss'

interface AppSelectProps {
  options: Array<{
    value: string
    label: string
  }>
  onChange?: (value: string) => void
  value?: string
  placeholder?: string
}

export const AppSelect = ({
  options,
  onChange,
  value,
  placeholder,
}: AppSelectProps) => {
  return (
    <div className={styles.selectWrapper}>
      <select
        className={styles.appSelect}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className={styles.icon}>
        <Icon name="doubleChevron" size={12} />
      </div>
    </div>
  )
}
