import { ConditionIcon, ListItem, Text } from '@components'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createConditionDescription, createConditionName } from '@utils'
import cn from 'classnames'

import { Condition } from '@store'

import styles from './DraggableCondition.module.scss'

export const DraggableCondition = ({
  rule,
  onNavigate,
}: {
  rule: Condition
  onNavigate: (rule: Condition) => void
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `condition-${rule.id}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none', // Важно для предотвращения скролла на мобильных
  }

  const conditionName = createConditionName(rule)
  const conditionDescription = createConditionDescription(rule)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(styles.draggableCondition, {
        [styles.dragging]: isDragging,
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
        onClick={() => onNavigate(rule)}
      />
    </div>
  )
}
