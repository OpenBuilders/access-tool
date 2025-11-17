import { BlockNew, ConditionIcon, Group, GroupItem } from '@components'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd'
import { ConditionType, Group as GroupType } from '@types'
import { createConditionDescription, createConditionName } from '@utils'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useMoveChatConditionMutation } from '@store-new'

import styles from './AdminChatConditions.module.scss'

interface AdminChatConditionsProps {
  groups?: GroupType[]
  onGroupsChange?: (groups: GroupType[]) => void
}

export const AdminChatConditions = (props: AdminChatConditionsProps) => {
  const { groups: initialGroups, onGroupsChange } = props

  const params = useParams<{ chatSlug: string }>()
  const chatSlug = params.chatSlug || ''

  const {
    mutateAsync: moveChatConditionMutation,
    isPending: moveChatConditionIsPending,
  } = useMoveChatConditionMutation(chatSlug)

  // Локальное состояние для групп (если onGroupsChange не передан)
  const [localGroups, setLocalGroups] = useState<GroupType[]>(
    initialGroups || []
  )

  // Используем переданные группы или локальное состояние
  const groups = initialGroups || localGroups

  const onDragEnd = async (result: DropResult) => {
    const { destination, source } = result

    // Если элемент не был перемещен или нет destination
    if (!destination) {
      return
    }

    // Если элемент перемещен в то же место
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const sourceGroupId = parseInt(source.droppableId)
    const destGroupId = parseInt(destination.droppableId)

    // Создаем копию групп
    const newGroups = [...groups]
    const sourceGroup = newGroups.find((g) => g.id === sourceGroupId)
    const destGroup = newGroups.find((g) => g.id === destGroupId)

    if (!sourceGroup || !destGroup) {
      return
    }

    // Удаляем элемент из исходной группы
    const [removed] = sourceGroup.items.splice(source.index, 1)

    // Вставляем элемент в целевую группу
    destGroup.items.splice(destination.index, 0, removed)

    // Обновляем группы
    setLocalGroups(newGroups)
    await moveChatConditionMutation({
      ruleId: removed.id,
      groupId: destGroupId,
      type: removed.type,
      order: destination.index,
    })
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {groups.map((group, groupIndex) => {
        const isFirstGroup = groupIndex === 0
        const groupHeader = isFirstGroup ? 'Complete Tasks' : 'Or Complete'

        return (
          <BlockNew key={group.id} padding="24px 0 0 0">
            <Group header={groupHeader}>
              <Droppable droppableId={group.id.toString()}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      backgroundColor: snapshot.isDraggingOver
                        ? 'rgba(0, 0, 0, 0.05)'
                        : 'transparent',
                      minHeight: '20px',
                    }}
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
            </Group>
          </BlockNew>
        )
      })}
    </DragDropContext>
  )
}
