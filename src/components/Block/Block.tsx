import cn from 'classnames'

import styles from './Block.module.scss'

interface BlockProps {
  children: React.ReactNode
  margin?: 'top' | 'bottom' | 'left' | 'right'
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
  fixed?: 'top' | 'bottom'
  row?: boolean
  gap?: 0 | 2 | 4 | 6 | 8 | 10 | 12 | 14 | 16 | 18 | 20 | 24
  justify?: 'start' | 'center' | 'end' | 'between'
  align?: 'start' | 'center' | 'end'
}

export const Block = ({
  children,
  margin,
  marginValue,
  fixed,
  row,
  gap,
  justify,
  align,
}: BlockProps) => {
  const marginStyle = {
    marginTop: margin === 'top' ? marginValue : 0,
    marginBottom: margin === 'bottom' ? marginValue : 0,
    marginLeft: margin === 'left' ? marginValue : 0,
    marginRight: margin === 'right' ? marginValue : 0,
  }

  return (
    <div
      style={marginStyle}
      className={cn(
        styles.root,
        fixed && styles[fixed],
        row && styles.row,
        gap && styles[`gap-${gap}`],
        justify && styles[justify],
        align && styles[align]
      )}
    >
      {children}
    </div>
  )
}
