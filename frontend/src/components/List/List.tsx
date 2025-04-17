import cn from 'classnames'

import { Block } from '../Block'
import { Text } from '../Text'
import styles from './List.module.scss'

interface ListProps {
  children: React.ReactNode
  header?: string
  footer?: React.ReactNode | string
  separatorLeftGap?: 40 | 24 | 16 // равен размеру картинки в before
}

export const List = ({
  children,
  header,
  footer,
  separatorLeftGap,
}: ListProps) => {
  return (
    <>
      {header && (
        <Block margin="bottom" marginValue={6}>
          <Block margin="left" marginValue={16}>
            <Text type="caption" color="tertiary" uppercase>
              {header}
            </Text>
          </Block>
        </Block>
      )}
      <div
        className={cn(
          styles.list,
          separatorLeftGap && styles[`listWithSeparator-${separatorLeftGap}`]
        )}
      >
        {children}
      </div>
      {footer && (
        <Block margin="top" marginValue={6}>
          <Block padding="left" paddingValue={16}>
            <Text type="caption" color="tertiary" as="div">
              {footer}
            </Text>
          </Block>
        </Block>
      )}
    </>
  )
}
