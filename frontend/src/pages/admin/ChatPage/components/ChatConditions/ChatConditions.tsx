import {
  Block,
  ConditionIcon,
  Icon,
  List,
  ListItem,
  Text,
  useToast,
} from '@components'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
  TouchSensor,
  rectIntersection,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { useAppNavigation } from '@hooks'
import { CONDITION_TYPES } from '@pages'
import { ROUTES_NAME } from '@routes'
import { createConditionDescription, createConditionName } from '@utils'
import { useState, useEffect } from 'react'

import { useChat, Condition, useChatActions, ConditionType } from '@store'

import { DraggableCondition } from '../DraggableCondition'
import { DroppableGroup } from '../DroppableGroup'
import styles from './ChatConditions.module.scss'

export const ChatConditions = () => {
  const { appNavigate } = useAppNavigation()
  const { chat, rules, groups } = useChat()

  const [activeId, setActiveId] = useState<string | null>(null)

  const [localGroups, setLocalGroups] = useState(groups || [])

  const [isLoading, setIsLoading] = useState(false)

  const { moveChatConditionAction } = useChatActions()

  const { showToast } = useToast()

  const moveChatCondition = async (
    condition: Condition,
    groupId: number,
    order: number
  ) => {
    setIsLoading(true)
    try {
      await moveChatConditionAction({
        ruleId: condition.id,
        groupId: groupId,
        type: condition.type as ConditionType,
        order: order,
        chatSlug: chat?.slug || '',
      })
    } catch (error) {
      console.log(error)
      showToast({
        message: 'Failed to move condition',
        type: 'error',
      })
    } finally {
      setTimeout(() => {
        setIsLoading(false)
      }, 3000)
    }
  }

  useEffect(() => {
    if (groups) {
      setLocalGroups(groups)
    }
  }, [groups])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

  const createCondition = async (groupId?: number) => {
    if (!chat?.slug) return
    appNavigate({
      path: ROUTES_NAME.CHAT_NEW_CONDITION,
      params: {
        chatSlug: chat?.slug,
        conditionType: CONDITION_TYPES[0].value,
      },
      state: {
        groupId: groupId || null,
      },
    })
  }

  const navigateToConditionPage = (rule: Condition) => {
    appNavigate({
      path: ROUTES_NAME.CHAT_CONDITION,
      params: {
        conditionId: rule.id,
        chatSlug: chat?.slug,
        conditionType: rule.type,
      },
    })
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Если перетаскиваем условие в другую группу
    if (activeId.startsWith('condition-') && overId.startsWith('group-')) {
      const conditionId = parseInt(activeId.replace('condition-', ''))
      const targetGroupId = parseInt(overId.replace('group-', ''))

      // Здесь можно добавить логику перемещения условия между группами
      console.log('fdsfsdf')
      console.log(`Moving condition ${conditionId} to group ${targetGroupId}`)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Если перетаскиваем условие в пределах одной группы
    if (activeId.startsWith('condition-') && overId.startsWith('condition-')) {
      const activeConditionId = parseInt(activeId.replace('condition-', ''))
      const overConditionId = parseInt(overId.replace('condition-', ''))

      // Найти группы, содержащие эти условия
      const activeGroupIndex = localGroups.findIndex((group) =>
        group.items.some((item) => item.id === activeConditionId)
      )
      const overGroupIndex = localGroups.findIndex((group) =>
        group.items.some((item) => item.id === overConditionId)
      )

      if (activeGroupIndex === overGroupIndex && activeGroupIndex !== -1) {
        const group = localGroups[activeGroupIndex]
        const oldIndex = group.items.findIndex(
          (item) => item.id === activeConditionId
        )
        const newIndex = group.items.findIndex(
          (item) => item.id === overConditionId
        )

        if (oldIndex !== newIndex) {
          const newGroups = [...localGroups]
          newGroups[activeGroupIndex] = {
            ...group,
            items: arrayMove(group.items, oldIndex, newIndex),
          }
          const groupsWithItems = newGroups.filter(
            (group) => group.items.length > 0
          )
          setLocalGroups(groupsWithItems)

          const condition = newGroups[activeGroupIndex].items[newIndex]

          moveChatCondition(condition, group.id, newIndex)
        }
      }
    }

    // Если перетаскиваем условие в другую группу
    if (activeId.startsWith('condition-') && overId.startsWith('group-')) {
      const activeConditionId = parseInt(activeId.replace('condition-', ''))
      const targetGroupId = parseInt(overId.replace('group-', ''))

      // Найти исходную группу
      const sourceGroupIndex = localGroups.findIndex((group) =>
        group.items.some((item) => item.id === activeConditionId)
      )

      // Найти целевую группу
      const targetGroupIndex = localGroups.findIndex(
        (group) => group.id === targetGroupId
      )

      if (
        sourceGroupIndex !== -1 &&
        targetGroupIndex !== -1 &&
        sourceGroupIndex !== targetGroupIndex
      ) {
        const sourceGroup = localGroups[sourceGroupIndex]
        const targetGroup = localGroups[targetGroupIndex]

        // Найти условие в исходной группе
        const conditionIndex = sourceGroup.items.findIndex(
          (item) => item.id === activeConditionId
        )
        const condition = sourceGroup.items[conditionIndex]

        if (conditionIndex !== -1) {
          const newGroups = [...localGroups]

          // Удалить условие из исходной группы
          newGroups[sourceGroupIndex] = {
            ...sourceGroup,
            items: sourceGroup.items.filter(
              (item) => item.id !== activeConditionId
            ),
          }

          // Добавить условие в целевую группу
          newGroups[targetGroupIndex] = {
            ...targetGroup,
            items: [...targetGroup.items, condition],
          }

          const groupsWithItems = newGroups.filter(
            (group) => group.items.length > 0
          )

          setLocalGroups(groupsWithItems)

          moveChatCondition(condition, targetGroupId, conditionIndex)
        }
      }
    }
  }

  const noRules = !rules || rules.length === 0

  // Получить активное условие для DragOverlay
  const activeCondition = activeId?.startsWith('condition-')
    ? localGroups
        .flatMap((group) => group.items)
        .find((item) => `condition-${item.id}` === activeId)
    : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {localGroups?.map((group, index) => {
        const groupTitle = index === 0 ? 'Complete Tasks' : 'Or Complete'
        return (
          <SortableContext
            items={localGroups.flatMap((group) =>
              group.items.map((item) => `condition-${item.id}`)
            )}
            key={group.id}
            strategy={verticalListSortingStrategy}
            disabled={isLoading}
          >
            <DroppableGroup
              id={group.id}
              groupTitle={groupTitle}
              onCreateCondition={createCondition}
              isLoading={isLoading}
            >
              {group?.items?.map((rule) => (
                <DraggableCondition
                  key={`condition-${rule.id}`}
                  rule={rule}
                  onNavigate={navigateToConditionPage}
                />
              ))}
            </DroppableGroup>
          </SortableContext>
        )
      })}

      <DragOverlay>
        {activeCondition ? (
          <div className={styles.dragOverlay}>
            <ListItem
              padding="4px 16px"
              height={activeCondition.description ? '60px' : '50px'}
              before={<ConditionIcon condition={activeCondition} />}
              key={`${activeCondition.id}-${activeCondition.type}`}
              text={
                <Text type="text" color="primary">
                  {createConditionName(activeCondition)}
                </Text>
              }
              description={
                <Text type="caption2" color="tertiary">
                  {createConditionDescription(activeCondition)}
                </Text>
              }
            />
          </div>
        ) : null}
      </DragOverlay>

      <Block margin="top" marginValue={24}>
        <List separatorLeftGap={40}>
          <ListItem
            padding="4px 16px"
            height="50px"
            text={
              <Text type="text" color="accent">
                {noRules ? 'Add Condition' : 'Add New Group'}
              </Text>
            }
            onClick={createCondition}
            before={
              <div className={styles.iconContainer}>
                <Icon name="plus" size={28} />
              </div>
            }
          />
        </List>
      </Block>
    </DndContext>
  )
}
