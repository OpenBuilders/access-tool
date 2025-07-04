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
  DragOverlay,
  DragStartEvent,
  useSensor,
  useSensors,
  KeyboardSensor,
  TouchSensor,
  PointerSensor,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
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

const webApp = window.Telegram.WebApp

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
      webApp.HapticFeedback.impactOccurred('soft')
    } catch (error) {
      console.error(error)
      showToast({
        message: 'Failed to move condition',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (groups) {
      setLocalGroups(groups)
    }
  }, [groups])

  const sensors = useSensors(
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 8,
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

  const canDrag = localGroups && localGroups.length > 1

  const handleDragStart = (event: DragStartEvent) => {
    if (!canDrag) return
    setActiveId(event.active.id as string)
    webApp.HapticFeedback.impactOccurred('light')

    // Предотвращаем стандартное поведение браузера в Safari
    if (event.active) {
      event.active.data.current?.preventDefault?.()
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // только между группами, добавляем в конец
    if (activeId.startsWith('condition-') && overId.startsWith('group-')) {
      const activeIdParts = activeId.replace('condition-', '').split('-')
      const activeConditionId = parseInt(activeIdParts[0])
      const activeConditionType = activeIdParts[1]
      const targetGroupId = parseInt(overId.replace('group-', ''))

      const sourceGroupIndex = localGroups.findIndex((group) =>
        group.items.some(
          (item) =>
            item.id === activeConditionId && item.type === activeConditionType
        )
      )
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

        const conditionIndex = sourceGroup.items.findIndex(
          (item) =>
            item.id === activeConditionId && item.type === activeConditionType
        )
        const [condition] = sourceGroup.items.splice(conditionIndex, 1)

        const newGroups = [...localGroups]
        newGroups[sourceGroupIndex] = {
          ...sourceGroup,
          items: sourceGroup.items,
        }
        newGroups[targetGroupIndex] = {
          ...targetGroup,
          items: [...targetGroup.items, condition],
        }

        const groupsWithItems = newGroups.filter(
          (group) => group.items.length > 0
        )

        setLocalGroups(groupsWithItems)

        moveChatCondition(condition, targetGroupId, targetGroup.items.length)
      }
    }
  }

  const noRules = !rules || rules.length === 0

  const activeCondition = activeId?.startsWith('condition-')
    ? localGroups
        .flatMap((group) => group.items)
        .find((item) => `condition-${item.id}-${item.type}` === activeId)
    : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragMove={(event) => {
        event.active.data.current?.preventDefault?.()
      }}
      modifiers={[]}
    >
      {localGroups?.map((group, index) => {
        const groupTitle = index === 0 ? 'Complete Tasks' : 'Or Complete'
        return (
          <SortableContext
            key={group.id}
            items={group.items.map(
              (item) => `condition-${item.id}-${item.type}`
            )}
            strategy={verticalListSortingStrategy}
          >
            <DroppableGroup
              id={group.id}
              groupTitle={groupTitle}
              onCreateCondition={createCondition}
              isLoading={isLoading}
              canDrag={!!canDrag}
            >
              {group?.items?.map((rule) => (
                <DraggableCondition
                  key={`condition-${rule.id}-${rule.type}`}
                  rule={rule}
                  onNavigate={navigateToConditionPage}
                  activeId={activeId}
                  canDrag={!!canDrag}
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
