import {
  AppSelect,
  TelegramMainButton,
  Icon,
  DialogModal,
  useToast,
  Block,
  Text,
  ListItem,
} from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { removeEmptyFields } from '@utils'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  Condition,
  ConditionType,
  useCondition,
  useConditionActions,
} from '@store'

import { ConditionComponentProps } from '../../components/types'
import { CONDITION_COMPONENTS, CONDITION_TYPES } from '../../constants'

export const ConditionModule = () => {
  const { appNavigate } = useAppNavigation()
  const params = useParams<{
    chatSlug: string
    conditionId: string
    conditionType: string
  }>()
  const chatSlugParam = params.chatSlug
  const conditionIdParam = params.conditionId
  const conditionTypeParam = params.conditionType

  const [conditionState, setConditionState] = useState<Partial<Condition>>({})
  const [isSaved, setIsSaved] = useState(true)
  const [isValid, setIsValid] = useState(true)

  const { showToast } = useToast()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { condition } = useCondition()
  const { deleteConditionAction, updateConditionAction, fetchConditionAction } =
    useConditionActions()

  const handleOpenDialog = () => setIsDialogOpen(true)

  const setInitialState = useCallback((value: Partial<Condition>) => {
    setConditionState(value)
  }, [])

  const fetchCondition = async () => {
    if (!conditionIdParam || !chatSlugParam || !conditionTypeParam) return
    try {
      await fetchConditionAction({
        type: conditionTypeParam as ConditionType,
        chatSlug: chatSlugParam,
        conditionId: conditionIdParam,
      })
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchCondition()
  }, [conditionIdParam, conditionTypeParam])

  const navigateToChatPage = () => {
    appNavigate({
      path: ROUTES_NAME.CHAT,
      params: {
        chatSlug: chatSlugParam,
      },
    })
  }

  const handleDeleteCondition = async () => {
    if (!conditionIdParam || !chatSlugParam) return
    try {
      await deleteConditionAction({
        type: conditionTypeParam as ConditionType,
        chatSlug: chatSlugParam,
        conditionId: conditionIdParam,
      })
      showToast({
        message: 'Condition deleted successfully',
        type: 'success',
      })
      navigateToChatPage()
    } catch (error) {
      console.error(error)
      showToast({
        message: 'Failed to delete condition',
        type: 'error',
      })
    }
  }

  const handleChangeCondition = useCallback(
    (
      key: keyof Condition,
      value: string | number | number[] | undefined | boolean
    ) => {
      setIsSaved(false)
      setConditionState((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const toggleIsValid = useCallback((value: boolean) => {
    setIsValid(value)
  }, [])

  const handleUpdateCondition = async () => {
    if (!conditionIdParam || !chatSlugParam) return
    const data = removeEmptyFields(conditionState)
    try {
      await updateConditionAction({
        type: conditionTypeParam as ConditionType,
        chatSlug: chatSlugParam,
        conditionId: conditionIdParam,
        data,
      })
      showToast({
        message: 'Condition updated successfully',
        type: 'success',
      })
      navigateToChatPage()
    } catch (error) {
      console.error(error)
      showToast({
        message: 'Failed to update condition',
        type: 'error',
      })
    }
  }
  if (!condition) return null

  const Component =
    CONDITION_COMPONENTS[
      conditionTypeParam as keyof typeof CONDITION_COMPONENTS
    ]

  if (!Component) return null

  const payload: ConditionComponentProps = {
    isNewCondition: false,
    handleChangeCondition,
    toggleIsValid,
    conditionState,
    setInitialState,
    condition,
  }
  return (
    <>
      <TelegramMainButton
        text="Save"
        disabled={!isValid || isSaved}
        onClick={handleUpdateCondition}
      />
      <Block margin="top" marginValue={32}>
        <Text type="title1" weight="bold" align="center">
          Edit condition
        </Text>
      </Block>
      <Block margin="top" marginValue={44}>
        <ListItem
          text="Condition type"
          disabled
          after={
            <AppSelect
              // onChange={() => {}}
              options={CONDITION_TYPES}
              value={conditionState?.type}
              disabled
            />
          }
        />
      </Block>
      {Component && <Component {...payload} />}
      <Block margin="top" marginValue={24}>
        <ListItem
          text={
            <Text type="text" color="danger">
              Remove Condition
            </Text>
          }
          before={<Icon name="trash" size={24} />}
          onClick={handleOpenDialog}
        />
      </Block>
      <DialogModal
        active={isDialogOpen}
        title="Remove Condition?"
        description="Removing this condition will delete all created dependencies. Are you sure you want to remove?"
        confirmText="Remove"
        closeText="Cancel"
        onClose={() => setIsDialogOpen(false)}
        onDelete={handleDeleteCondition}
      />
    </>
  )
}
