import cn from 'classnames'

import styles from './Text.module.scss'

interface TextProps {
  children: React.ReactNode | string
  type: 'title' | 'title1' | 'text' | 'link' | 'caption'
  align?: 'left' | 'center' | 'right'
  color?: 'primary' | 'hint' | 'accent'
  weight?: 'normal' | 'medium' | 'bold'
  href?: string
  as?: 'p' | 'span' | 'div' | 'a'
  uppercase?: boolean
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
        uppercase && styles.uppercase
      )}
      {...(href && { href })}
      {...(as && { as })}
    >
      {children}
    </Component>
  )
}
