import cn from 'classnames'
import { forwardRef, useState, useCallback } from 'react'

import styles from './GroupInput.module.scss'
import { GroupInputProps } from './types'

export const GroupInput = forwardRef<HTMLInputElement, GroupInputProps>(
  (props, ref) => {
    const {
      value,
      placeholder,
      type = 'text',
      disabled = false,
      readOnly = false,
      required = false,
      autoFocus = false,
      autoComplete,
      name,
      id,
      maxLength,
      minLength,
      pattern,
      size,
      spellCheck,
      tabIndex,
      numeric = false,
      decimal = false,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      onKeyUp,
      onInput,
      onPaste,
      onCopy,
      onCut,
      validator,
      validateOnBlur = true,
      validateOnChange = false,
      error: externalError,
      className,
      style,
      'data-testid': dataTestId,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedby,
      'aria-invalid': ariaInvalid,
      'aria-required': ariaRequired,
      ...restProps
    } = props

    // Состояние для внутренней валидации
    const [internalError, setInternalError] = useState<string | null>(null)

    // Валидация
    const validate = useCallback(
      (valueToValidate: string): boolean => {
        if (validator) {
          const validationError = validator(valueToValidate)
          setInternalError(validationError)
          return !validationError
        }
        return true
      },
      [validator]
    )

    // Обработчики событий
    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value

        if (validateOnChange) {
          validate(newValue)
        }

        onChange?.(newValue, event)
      },
      [validateOnChange, validate, onChange]
    )

    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        onFocus?.(event)
      },
      [onFocus]
    )

    const handleBlur = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        if (validateOnBlur) {
          validate(value)
        }

        onBlur?.(event)
      },
      [validateOnBlur, validate, value, onBlur]
    )

    // Определяем ошибку (внешняя имеет приоритет)
    const error = externalError || internalError

    return (
      <input
        ref={ref}
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        name={name}
        id={id}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        size={size}
        spellCheck={spellCheck}
        tabIndex={tabIndex}
        inputMode={
          (numeric && 'numeric') || (decimal && 'decimal') || undefined
        }
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onInput={onInput}
        onPaste={onPaste}
        onCopy={onCopy}
        onCut={onCut}
        className={cn(styles.input, className)}
        style={style}
        data-testid={dataTestId}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        aria-invalid={ariaInvalid ?? !!error}
        aria-required={ariaRequired ?? required}
        {...restProps}
      />
    )
  }
)
