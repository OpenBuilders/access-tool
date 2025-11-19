import cn from 'classnames'
import { useEffect, useRef } from 'react'

import { Icon } from '../Icon'
import { Text } from '../Text'
import styles from './Dropdown.module.scss'

type DropdownOption = {
  label: string
  value?: string
}

type DropdownProps = {
  options: DropdownOption[]
  active: boolean
  selectedValue?: string
  onSelect: (value?: string) => void
  onClose: () => void
  className?: string
  triggerRef?: React.RefObject<HTMLElement>
}

export const Dropdown = ({
  options,
  active,
  selectedValue,
  onSelect,
  onClose,
  className,
  triggerRef,
}: DropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!active) {
      return
    }

    const handleClickOutside = (event: PointerEvent) => {
      const target = event.target as Node

      if (
        dropdownRef.current?.contains(target) ||
        triggerRef?.current?.contains(target)
      ) {
        return
      }

      onClose()
    }

    document.addEventListener('pointerdown', handleClickOutside, true)

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside, true)
    }
  }, [active, onClose, triggerRef])

  const handleSelect = (value?: string) => {
    onSelect(value)
    onClose()
  }

  return (
    <div
      ref={dropdownRef}
      className={cn(
        styles.dropdown,
        active && styles.dropdownActive,
        className
      )}
    >
      <ul className={styles.list}>
        {options.map(({ label, value }) => {
          const isSelected = value === selectedValue

          return (
            <li
              key={value}
              className={cn(styles.item, isSelected && styles.itemActive)}
              onClick={() => handleSelect(value)}
            >
              <Icon
                name="checkmark"
                color="secondary"
                className={cn(
                  styles.checkIcon,
                  isSelected && styles.checkIconActive
                )}
                size={16}
              />

              <Text type="text" color="primary">
                {label}
              </Text>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
