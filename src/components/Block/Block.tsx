import cn from 'classnames'

import styles from './Block.module.scss'

interface BlockProps {
  children: React.ReactNode
  margin?: 'top' | 'bottom' | 'left' | 'right'
  marginValue?: 2 | 4 | 6 | 8 | 10 | 12 | 14 | 16 | 18 | 20 | 24 | 'auto'
  fixed?: 'top' | 'bottom'
}

export const Block = ({ children, margin, marginValue, fixed }: BlockProps) => {
  const marginStyle = {
    marginTop: margin === 'top' ? marginValue : 0,
    marginBottom: margin === 'bottom' ? marginValue : 0,
    marginLeft: margin === 'left' ? marginValue : 0,
    marginRight: margin === 'right' ? marginValue : 0,
  }

  return (
    <div
      style={marginStyle}
      className={cn(styles.root, fixed && styles[fixed])}
    >
      {children}
    </div>
  )
}
