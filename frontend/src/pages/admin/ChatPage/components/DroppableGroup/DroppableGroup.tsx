import { Block, List, Spinner, Text } from '@components'
import { useDroppable } from '@dnd-kit/core'
import cn from 'classnames'

import styles from './DroppableGroup.module.scss'

export const DroppableGroup = ({
  children,
  id,
  groupTitle,
  onCreateCondition,
  isLoading,
}: {
  children: React.ReactNode
  id: number
  groupTitle: string
  onCreateCondition: (groupId?: number) => void
  isLoading: boolean
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `group-${id}`,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(styles.droppableGroup, {
        [styles.isOver]: isOver,
      })}
    >
      <Block>
        <List
          header={groupTitle}
          separatorLeftGap={40}
          action={
            isLoading ? (
              <Spinner size={14} />
            ) : (
              <Text
                align="right"
                type="caption"
                color="accent"
                uppercase
                onClick={() => onCreateCondition(id)}
              >
                Add Condition
              </Text>
            )
          }
        >
          {children}
        </List>
      </Block>
    </div>
  )
}
