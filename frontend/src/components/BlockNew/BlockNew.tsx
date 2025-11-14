import cn from 'classnames'

import styles from './BlockNew.module.scss'

interface BlockNewProps {
  id?: string
  children: React.ReactNode
  margin?: string
  defaultWidth?: boolean
  marginValue?:
    | 0
    | 2
    | 4
    | 6
    | 8
    | 10
    | 12
    | 14
    | 16
    | 18
    | 20
    | 24
    | 32
    | 44
    | 'auto'
  padding?: string
  paddingValue?:
    | 0
    | 2
    | 4
    | 6
    | 8
    | 10
    | 12
    | 14
    | 16
    | 18
    | 20
    | 24
    | 32
    | 44
    | 'auto'
  fixed?: 'top' | 'bottom'
  row?: boolean
  gap?: 0 | 2 | 4 | 6 | 8 | 10 | 12 | 14 | 16 | 18 | 20 | 24
  justify?: 'start' | 'center' | 'end' | 'between'
  align?: 'start' | 'center' | 'end'
  fadeIn?: boolean
  className?: string
  onClick?: () => void
}

export const BlockNew = ({
  id,
  children,
  fixed,
  row,
  gap,
  justify,
  align,
  padding,
  onClick,
  fadeIn = true,
  defaultWidth = false,
  className,
  margin,
}: BlockNewProps) => {
  return (
    <div
      id={id}
      onClick={onClick}
      style={{
        padding,
        margin,
      }}
      className={cn(
        styles.block,
        fixed && styles[fixed],
        row && styles.row,
        gap && styles[`gap-${gap}`],
        justify && styles[`justify-${justify}`],
        align && styles[`align-${align}`],
        fadeIn && styles.fadeIn,
        defaultWidth && styles.defaultWidth,
        className
      )}
    >
      {children}
    </div>
  )
}
