import { Icon } from '../Icon'
import styles from './AppSelect.module.scss'

interface AppSelectProps {
  options?: {
    value: string
    name: string
  }[]
  onChange?: (value: string) => void
  value?: string
  placeholder?: string
  disabled?: boolean
}

export const AppSelect = ({
  options,
  onChange,
  value,
  placeholder,
  disabled,
}: AppSelectProps) => {
  return (
    <div className={styles.selectWrapper}>
      <select
        className={styles.appSelect}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        dir="rtl"
      >
        {placeholder && (
          <option dir="ltr" value="" disabled>
            {placeholder}
          </option>
        )}
        {options?.map((option) => (
          <option key={option.value} dir="ltr" value={option.value}>
            {option.name}
          </option>
        ))}
      </select>
      <div className={styles.icon}>
        <Icon name="doubleChevron" size={12} />
      </div>
    </div>
  )
}
