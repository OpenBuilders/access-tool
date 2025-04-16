import {
  AppSelect,
  TelegramMainButton,
  useToast,
  Text,
  Block,
  ListItem,
} from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'

import { Condition, ConditionType, useConditionActions } from '@store'

import { ConditionComponentProps } from '../../components/types'
import { CONDITION_COMPONENTS, CONDITION_TYPES } from '../../constants'

export const NewConditionModule = () => {
  const { appNavigate } = useAppNavigation()
  const params = useParams<{
    chatSlug: string
    conditionType: string
  }>()

  const chatSlugParam = params.chatSlug || ''
  const conditionTypeParam = params.conditionType || ''

  const [isValid, setIsValid] = useState(false)
  const [conditionState, setConditionState] = useState<Partial<Condition>>({
    type: 'jetton',
  })

  const { createConditionAction, resetPrefetchedConditionDataAction } =
    useConditionActions()

  const { showToast } = useToast()

  const Component =
    CONDITION_COMPONENTS[
      conditionState.type as keyof typeof CONDITION_COMPONENTS
    ]

  const navigateToChatPage = useCallback(() => {
    appNavigate({
      path: ROUTES_NAME.CHAT,
      params: { chatSlug: chatSlugParam },
    })
  }, [appNavigate, chatSlugParam])

  if (!Component) return null

  const handleChangeCondition = useCallback(
    (key: keyof Condition, value: string | number | number[]) => {
      setConditionState((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const toggleIsValid = useCallback((value: boolean) => {
    setIsValid(value)
  }, [])

  const handleCreateCondition = useCallback(async () => {
    if (!isValid) return
    try {
      await createConditionAction({
        type: conditionTypeParam as ConditionType,
        chatSlug: chatSlugParam,
        data: conditionState,
      })
      navigateToChatPage()
      showToast({
        message: 'Condition created successfully',
        type: 'success',
      })
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        showToast({
          message: error.message,
          type: 'error',
        })
        return
      }

      showToast({
        message: 'Failed to create condition',
        type: 'error',
      })
    }
  }, [conditionState, isValid])

  const handleChangeType = (value: string) => {
    resetPrefetchedConditionDataAction()
    handleChangeCondition('type', value)
    appNavigate({
      path: ROUTES_NAME.CHAT_NEW_CONDITION,
      params: {
        conditionType: value,
        chatSlug: chatSlugParam,
      },
    })
  }

  const setInitialState = useCallback((value: Partial<Condition>) => {
    setConditionState(value)
  }, [])

  const payload: ConditionComponentProps = {
    isNewCondition: true,
    handleChangeCondition,
    toggleIsValid,
    conditionState,
    setInitialState,
  }

  return (
    <>
      <TelegramMainButton
        text="Create Condition"
        disabled={!isValid}
        onClick={handleCreateCondition}
      />
      <Block margin="top" marginValue={32}>
        <Text type="title1" weight="bold" align="center">
          Add condition
        </Text>
      </Block>
      <Block margin="top" marginValue={44}>
        <ListItem
          text="Choose type"
          after={
            <AppSelect
              onChange={(value) => handleChangeType(value)}
              options={CONDITION_TYPES}
              value={conditionState.type}
            />
          }
        />
      </Block>
      {Component && <Component {...payload} />}
    </>
  )
}
