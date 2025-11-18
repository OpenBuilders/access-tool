import { Icon, Text } from '@components'
import { hapticFeedback } from '@utils'
import cn from 'classnames'
import { useEffect, useRef, useState } from 'react'

import styles from './GroupItem.module.scss'

interface GroupProps {
  isDragging?: boolean
  main?: React.ReactNode
  text?: React.ReactNode
  description?: React.ReactNode
  before?: React.ReactNode
  after?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  chevron?: boolean
}

const GROUP_ITEM_GAP = 10
const ITEM_LEFT_GAP = 16

const renderText = (text: string | React.ReactNode) => {
  if (typeof text === 'string') {
    return <Text type="text">{text}</Text>
  }
  return text
}

const renderDescription = (description: string | React.ReactNode) => {
  if (typeof description === 'string') {
    return (
      <Text type="caption" color="secondary">
        {description}
      </Text>
    )
  }
  return description
}

export const GroupItem = ({
  isDragging,
  main,
  text,
  description,
  before,
  after,
  disabled,
  onClick,
  chevron,
}: GroupProps) => {
  const beforeRef = useRef<HTMLDivElement>(null)

  const [leftGapBottomBorder, setLeftGapBottomBorder] = useState(0)

  const handleClick = () => {
    if (onClick && !disabled) {
      hapticFeedback('soft')
      onClick()
    }
  }

  useEffect(() => {
    if (beforeRef.current) {
      const beforeWidth = beforeRef.current.getBoundingClientRect().width
      setLeftGapBottomBorder(beforeWidth + ITEM_LEFT_GAP + GROUP_ITEM_GAP)
      return
    }

    setLeftGapBottomBorder(ITEM_LEFT_GAP)
  }, [before])

  return (
    <div
      className={cn(
        styles.container,
        onClick && styles.clickable,
        disabled && styles.disabled,
        isDragging && styles.dragging
      )}
      onClick={handleClick}
      data-group-item
    >
      {before && (
        <div ref={beforeRef} className={styles.before}>
          {before}
        </div>
      )}
      <div className={styles.main}>
        <div className={styles.content}>
          {main && main}
          {text && renderText(text)}
          {description && renderDescription(description)}
        </div>
        {after && <div className={styles.after}>{after}</div>}
        {chevron && (
          <div className={styles.chevron}>
            <Icon name="chevron" />
          </div>
        )}
      </div>
      <div
        data-group-item-border-bottom
        className={styles.bottomBorder}
        style={{ left: leftGapBottomBorder }}
      />
    </div>
  )
}
