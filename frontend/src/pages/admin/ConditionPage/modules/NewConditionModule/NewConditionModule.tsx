import {
  AppSelect,
  TelegramBackButton,
  TelegramMainButton,
  PageLayout,
  useToast,
  Text,
  Block,
  ListItem,
} from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import {
  Condition,
  ConditionType,
  useCondition,
  useConditionActions,
} from '@store'

import { CONDITION_COMPONENTS, CONDITION_TYPES } from '../../constants'
import { createUpdatedData } from './helpers'

export const NewConditionModule = () => {
  const { appNavigate } = useAppNavigation()
  const params = useParams<{
    chatSlug: string
    conditionType: string
  }>()

  const chatSlugParam = params.chatSlug || ''
  const conditionTypeParam = params.conditionType || ''

  const {
    createConditionAction,
    resetPrefetchedConditionDataAction,
    handleChangeConditionFieldAction,
  } = useConditionActions()
  const { isValid, condition } = useCondition()

  const { showToast } = useToast()

  const Component =
    CONDITION_COMPONENTS[
      conditionTypeParam as keyof typeof CONDITION_COMPONENTS
    ]

  const navigateToChatPage = () => {
    appNavigate({
      path: ROUTES_NAME.CHAT,
      params: { chatSlug: chatSlugParam },
    })
  }

  useEffect(() => {
    if (conditionTypeParam) {
      handleChangeConditionFieldAction('type', conditionTypeParam)
    }
  }, [conditionTypeParam])

  if (!Component || !condition) return null

  const handleCreateCondition = async () => {
    try {
      const updatedData = createUpdatedData(condition as Condition)

      if (!updatedData) {
        throw new Error('Failed to create condition. Try again later')
      }

      await createConditionAction({
        type: conditionTypeParam as ConditionType,
        chatSlug: chatSlugParam,
        data: updatedData,
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
  }

  const handleChangeType = (value: string) => {
    resetPrefetchedConditionDataAction()
    handleChangeConditionFieldAction('type', value)
    appNavigate({
      path: ROUTES_NAME.CHAT_NEW_CONDITION,
      params: {
        conditionType: value,
        chatSlug: chatSlugParam,
      },
    })
  }

  console.log(isValid)

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
              value={condition?.type}
            />
          }
        />
      </Block>
      {Component && <Component isNewCondition />}
    </>
  )
}
