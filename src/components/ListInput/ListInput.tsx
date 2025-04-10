import cn from 'classnames'
import React, { ChangeEvent } from 'react'

import styles from './ListInput.module.scss'

export interface ListInputProps {
  textColor?: 'primary' | 'secondary' | 'tertiary'
  value?: string | number
  onChange?: (value: string) => void
  onBlur?: () => void
  type?: 'text' | 'number' | 'password' | 'email' | 'tel' | 'url' | 'search'
  placeholder?: string
  disabled?: boolean
  className?: string
  autoComplete?: 'on' | 'off'
  maxLength?: number
  minLength?: number
  pattern?: string
  required?: boolean
  readOnly?: boolean
  name?: string
  id?: string
  inputMode?:
    | 'none'
    | 'text'
    | 'decimal'
    | 'numeric'
    | 'tel'
    | 'search'
    | 'email'
    | 'url'
}

export const ListInput: React.FC<ListInputProps> = ({
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled = false,
  className,
  autoComplete = 'off',
  maxLength,
  minLength,
  pattern,
  required = false,
  readOnly = false,
  name,
  id,
  textColor = 'primary',
  inputMode,
  onBlur,
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  return (
    <input
      className={cn(
        styles.listInput,
        textColor && styles[`listInput-${textColor}`],
        className
      )}
      type={type}
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete={autoComplete}
      maxLength={maxLength}
      minLength={minLength}
      pattern={pattern}
      required={required}
      readOnly={readOnly}
      name={name}
      id={id}
      inputMode={inputMode}
    />
  )
}
