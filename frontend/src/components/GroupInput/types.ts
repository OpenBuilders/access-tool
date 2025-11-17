export interface GroupInputProps {
  value: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  autoFocus?: boolean
  autoComplete?: string
  name?: string
  id?: string
  maxLength?: number
  minLength?: number
  pattern?: string
  size?: number
  spellCheck?: boolean
  tabIndex?: number
  numeric?: boolean
  decimal?: boolean
  // События
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  onInput?: (event: React.FormEvent<HTMLInputElement>) => void
  onPaste?: (event: React.ClipboardEvent<HTMLInputElement>) => void
  onCopy?: (event: React.ClipboardEvent<HTMLInputElement>) => void
  onCut?: (event: React.ClipboardEvent<HTMLInputElement>) => void
  // Валидация
  validator?: (value: string) => string | null // возвращает ошибку или null
  validateOnBlur?: boolean
  validateOnChange?: boolean
  // Состояние
  error?: string
  success?: boolean
  // Дополнительные пропсы для передачи в DOM элемент
  className?: string
  style?: React.CSSProperties
  'data-testid'?: string
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  'aria-required'?: boolean
}
