import { ConditionIcon, ListItem, Text } from '@components'
import { useDraggable } from '@dnd-kit/core'
import { createConditionDescription, createConditionName } from '@utils'
import cn from 'classnames'

import { Condition } from '@store'

import styles from './DraggableCondition.module.scss'

interface DraggableConditionProps {
  rule: Condition
  onNavigate: (rule: Condition) => void
  activeId: string | null
  canDrag: boolean
}

export const DraggableCondition = ({
  rule,
  onNavigate,
  activeId,
  canDrag,
}: DraggableConditionProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `condition-${rule.id}`,
  })

  const conditionName = createConditionName(rule)
  const conditionDescription = createConditionDescription(rule)

  return (
    <div
      ref={setNodeRef}
      className={cn(styles.draggableCondition, {
        [styles.dragging]: isDragging,
        [styles.noPointerEvents]: activeId,
      })}
    >
      <ListItem
        padding="4px 16px"
        height={conditionDescription ? '60px' : '50px'}
        before={<ConditionIcon condition={rule} />}
        key={`${rule.id}-${rule.type}`}
        text={
          <Text type="text" color="primary">
            {conditionName}
          </Text>
        }
        description={
          <Text type="caption2" color="tertiary">
            {conditionDescription}
          </Text>
        }
        after={
          canDrag && (
            <div className={styles.dragIcon} {...attributes} {...listeners}>
              <span />
            </div>
          )
        }
        onClick={() => onNavigate(rule)}
      />
    </div>
  )
}
