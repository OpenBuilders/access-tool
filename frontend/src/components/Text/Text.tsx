import cn from 'classnames'

import styles from './Text.module.scss'

interface TextProps {
  children: React.ReactNode | string
  type:
    | 'hero'
    | 'title'
    | 'title1'
    | 'title2'
    | 'text'
    | 'link'
    | 'caption'
    | 'caption2'
  align?: 'left' | 'center' | 'right'
  color?: 'primary' | 'tertiary' | 'secondary' | 'accent' | 'danger'
  weight?: 'normal' | 'medium' | 'bold'
  href?: string
  as?: 'p' | 'span' | 'div' | 'a'
  uppercase?: boolean
  onClick?: () => void
  className?: string
}

export const Text = ({
  children,
  type = 'text',
  align = 'left',
  color = 'primary',
  weight = 'normal',
  href,
  as = 'p',
  uppercase,
  onClick,
  className,
}: TextProps) => {
  const Component = as
  return (
    <Component
      className={cn(
        styles.container,
        styles[type],
        styles[align],
        styles[color],
        styles[weight],
        uppercase && styles.uppercase,
        onClick && styles.clickable,
        className
      )}
      {...(href && { href })}
      {...(as && { as })}
      onClick={onClick}
    >
      {children}
    </Component>
  )
}
