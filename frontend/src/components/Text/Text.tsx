import cn from 'classnames'

import styles from './Text.module.scss'

interface TextProps {
  children: React.ReactNode | string
  type: 'hero' | 'title' | 'title1' | 'text' | 'link' | 'caption' | 'caption2'
  align?: 'left' | 'center' | 'right'
  color?: 'primary' | 'tertiary' | 'secondary' | 'accent' | 'danger'
  weight?: 'normal' | 'medium' | 'bold'
  href?: string
  as?: 'p' | 'span' | 'div' | 'a'
  uppercase?: boolean
  onClick?: () => void
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
        onClick && styles.clickable
      )}
      {...(href && { href })}
      {...(as && { as })}
      onClick={onClick}
    >
      {children}
    </Component>
  )
}
