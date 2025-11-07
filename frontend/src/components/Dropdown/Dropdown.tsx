import cn from 'classnames'
import { useEffect, useRef } from 'react'

import { Icon } from '../Icon'
import styles from './Dropdown.module.scss'

type DropdownOption = {
  label: string
  value: string
}

type DropdownProps = {
  options: DropdownOption[]
  active: boolean
  selectedValue?: string
  onSelect: (value: string) => void
  onClose: () => void
  className?: string
}

export const Dropdown = ({
  options,
  active,
  selectedValue,
  onSelect,
  onClose,
  className,
}: DropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!active) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [active, onClose])

  if (!active) {
    return null
  }

  const handleSelect = (value: string) => {
    onSelect(value)
    onClose()
  }

  return (
    <div ref={dropdownRef} className={cn(styles.dropdown, className)}>
      <ul className={styles.list}>
        {options.map(({ label, value }) => {
          const isSelected = value === selectedValue

          return (
            <li
              key={value}
              className={cn(styles.item, isSelected && styles.itemActive)}
              onClick={() => handleSelect(value)}
            >
              <span>{label}</span>
              {isSelected && <Icon name="check" className={styles.checkIcon} />}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
