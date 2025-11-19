import { Option } from '@types'
import { useRef, useState } from 'react'

import { BlockNew } from '../BlockNew'
import { Dropdown } from '../Dropdown'
import { Icon } from '../Icon'
import { Text } from '../Text'
import styles from './Select.module.scss'

interface SelectProps {
  options: Option[]
  value?: string
  onChange: (value: string | null) => void
}

export const Select = (props: SelectProps) => {
  const { options, value, onChange } = props

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const selectRef = useRef<HTMLDivElement | null>(null)

  const handleToggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleSelect = (value: string | null) => {
    onChange(value)
    setIsDropdownOpen(false)
  }

  return (
    <div className={styles.select} ref={selectRef}>
      <BlockNew onClick={handleToggleDropdown} row gap={6} align="center">
        <Text type="text" color="accent">
          {options.find((option) => option.value === value)?.label}
        </Text>
        <Icon name="doubleChevron" size={12} />
      </BlockNew>
      <Dropdown
        active={isDropdownOpen}
        options={options}
        selectedValue={value}
        onSelect={(value) => handleSelect(value)}
        onClose={() => handleToggleDropdown()}
        triggerRef={selectRef}
      />
    </div>
  )
}
