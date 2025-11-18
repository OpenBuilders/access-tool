import { useRef, useState } from 'react'

import { Dropdown } from '../Dropdown'
import styles from './Select.module.scss'

type SelectOption = {
  label: string
  value: string
}

interface SelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
}

export const Select = (props: SelectProps) => {
  const { options, value, onChange } = props

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const selectRef = useRef<HTMLDivElement | null>(null)

  const handleToggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleSelect = (value: string) => {
    onChange(value)
    setIsDropdownOpen(false)
  }

  return (
    <div className={styles.select} ref={selectRef}>
      <div className={styles.selectTrigger} onClick={handleToggleDropdown}>
        <div className={styles.selectTriggerText}>
          {options.find((option) => option.value === value)?.label}
        </div>
      </div>
      <Dropdown
        active={isDropdownOpen}
        options={options}
        selectedValue={value}
        onSelect={(value: string) => handleSelect(value)}
        onClose={() => handleToggleDropdown()}
        triggerRef={selectRef}
      />
    </div>
  )
}
