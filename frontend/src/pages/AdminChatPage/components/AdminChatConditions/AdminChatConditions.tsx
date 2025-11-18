import {
  BlockNew,
  ConditionIcon,
  Group as GroupComponent,
  GroupItem,
  Icon,
  Text,
} from '@components'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd'
import { Group } from '@types'
import { createConditionDescription, createConditionName } from '@utils'
import cn from 'classnames'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useMoveChatConditionMutation } from '@store-new'

import styles from './AdminChatConditions.module.scss'

interface AdminChatConditionsProps {
  groups?: Group[]
}

export const AdminChatConditions = (props: AdminChatConditionsProps) => {
  const { groups: initialGroups } = props

  const params = useParams<{ chatSlug: string }>()
  const chatSlug = params.chatSlug || ''

  const {
    mutateAsync: moveChatConditionMutation,
    isPending: moveChatConditionIsPending,
  } = useMoveChatConditionMutation(chatSlug)

  const [localGroups, setLocalGroups] = useState<Group[]>(initialGroups || [])

  const groups = initialGroups || localGroups

  const onDragEnd = async (result: DropResult) => {
    const { destination, source } = result

    // Если элемент не был перемещен или нет destination
    if (!destination) {
      return
    }

    // Если элемент перемещен в ту же группу
    if (destination.droppableId === source.droppableId) {
      return
    }

    const sourceGroupId = parseInt(source.droppableId)
    const destGroupId = parseInt(destination.droppableId)

    const newGroups = [...groups]
    const sourceGroup = newGroups.find((g) => g.id === sourceGroupId)
    const destGroup = newGroups.find((g) => g.id === destGroupId)

    if (!sourceGroup || !destGroup) {
      return
    }

    const [removed] = sourceGroup.items.splice(source.index, 1)

    destGroup.items.splice(destination.index, 0, removed)

    setLocalGroups(newGroups)
    await moveChatConditionMutation({
      ruleId: removed.id,
      groupId: destGroupId,
      type: removed.type,
      order: destination.index,
    })
  }

  if (!initialGroups?.length) {
    return (
      <BlockNew padding="24px 0 0 0">
        <GroupComponent header="Complete Tasks">
          <GroupItem
            text={
              <Text type="text" color="accent">
                Add Condition
              </Text>
            }
            before={<Icon name="plus" size={28} />}
            onClick={() => console.log('add condition')}
          />
        </GroupComponent>
      </BlockNew>
    )
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {groups.map((group, groupIndex) => {
        const isFirstGroup = groupIndex === 0
        const groupHeader = isFirstGroup ? 'Complete Tasks' : 'Or Complete'
        const isConditionInGroup = group.items.length > 0

        const renderGroupAction = () => {
          if (isConditionInGroup) {
            return (
              <Text
                type="caption"
                color="accent"
                uppercase
                onClick={() => console.log('add condition')}
              >
                Add Condition
              </Text>
            )
          }
          return null
        }

        return (
          <BlockNew key={group.id} padding="24px 0 0 0">
            <GroupComponent header={groupHeader} action={renderGroupAction()}>
              <Droppable droppableId={group.id.toString()}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(styles.droppableContainer, {
                      [styles.droppableContainerOnDraggingOver]:
                        snapshot.isDraggingOver,
                    })}
                  >
                    {group.items.map((item, itemIndex) => (
                      <Draggable
                        key={item.id}
                        draggableId={`${item.id}-${item.type}`}
                        index={itemIndex}
                        isDragDisabled={moveChatConditionIsPending}
                      >
                        {(provided, snapshot) => {
                          const conditionName = createConditionName(item)
                          const conditionDescription =
                            createConditionDescription(item)
                          return (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn({
                                [styles.draggableItemOnDragging]:
                                  snapshot.isDragging,
                              })}
                            >
                              <GroupItem
                                chevron
                                text={conditionName}
                                description={conditionDescription}
                                isDragging={snapshot.isDragging}
                                before={<ConditionIcon condition={item} />}
                                disabled={moveChatConditionIsPending}
                              />
                            </div>
                          )
                        }}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </GroupComponent>
          </BlockNew>
        )
      })}
      <BlockNew padding="24px 0 0 0">
        <GroupComponent header="Or Complete">
          <GroupItem
            text={
              <Text type="text" color="accent">
                Add Condition
              </Text>
            }
            before={<Icon name="plus" size={28} />}
            onClick={() => console.log('add condition')}
          />
        </GroupComponent>
      </BlockNew>
    </DragDropContext>
  )
}
