import {
  AppSelect,
  Block,
  ListInput,
  ListItem,
  TelegramMainButton,
  Text,
  useToast,
} from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { removeEmptyFields } from '@utils'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  useConditionActions,
  ConditionCategory,
  Condition,
  useCondition,
} from '@store'

import { ConditionComponentProps } from '../types'

export const Toncoin = ({ isNewCondition }: ConditionComponentProps) => {
  const params = useParams<{
    chatSlug: string
    conditionId: string
  }>()
  const chatSlugParam = params.chatSlug || ''
  const conditionIdParam = params.conditionId

  const { condition } = useCondition()
  const {
    resetPrefetchedConditionDataAction,
    fetchConditionCategoriesAction,
    createConditionAction,
    updateConditionAction,
  } = useConditionActions()
  const { appNavigate } = useAppNavigation()

  const { showToast } = useToast()

  const [conditionState, setConditionState] =
    useState<Partial<Condition> | null>(null)
  const [categories, setCategories] = useState<ConditionCategory[]>([])

  const fetchConditionCategories = async () => {
    try {
      const result = await fetchConditionCategoriesAction('toncoin')

      if (!result) {
        throw new Error('Failed to fetch condition categories')
      }

      setCategories(result)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchConditionCategories()
    return () => resetPrefetchedConditionDataAction()
  }, [])

  useEffect(() => {
    if (categories?.length) {
      setConditionState({
        type: 'toncoin',
        asset: condition?.asset || categories[0].asset,
        category: condition?.category || categories[0].categories[0],
        expected: condition?.expected || '',
        isEnabled: isNewCondition ? undefined : condition?.isEnabled,
      })
    }
  }, [condition, categories?.length])

  const navigateToChatPage = () => {
    appNavigate({
      path: ROUTES_NAME.CHAT,
      params: { chatSlug: chatSlugParam },
    })
  }

  if (!conditionState || !categories?.length) return null

  const handleUpdateCondition = async () => {
    if (!conditionIdParam || !chatSlugParam) return
    const data = removeEmptyFields(conditionState)
    try {
      await updateConditionAction({
        type: 'toncoin',
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

  const handleCreateCondition = async () => {
    try {
      const data = removeEmptyFields(conditionState)
      await createConditionAction({
        type: 'toncoin',
        chatSlug: chatSlugParam,
        data,
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

  const handleChangeCondition = (key: keyof Condition, value: string) => {
    setConditionState({ ...conditionState, [key]: value })
  }

  const handleClick = () => {
    if (isNewCondition) {
      handleCreateCondition()
    } else {
      handleUpdateCondition()
    }
  }

  const buttonText = isNewCondition ? 'Add Condition' : 'Save'

  return (
    <>
      <TelegramMainButton text={buttonText} onClick={handleClick} />
      <Block margin="top" marginValue={24}>
        <ListItem
          text="Category"
          after={
            <AppSelect
              onChange={(value) => handleChangeCondition('category', value)}
              options={categories.map((category) => ({
                value: category.asset,
                name: category.asset,
              }))}
              value={conditionState?.asset}
            />
          }
        />
      </Block>
      <Block margin="top" marginValue={24}>
        <ListItem
          text="Amount"
          after={
            <ListInput
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              textColor="tertiary"
              after={
                <Text type="text" color="tertiary">
                  TON
                </Text>
              }
              value={conditionState?.expected}
              onChange={(value) => handleChangeCondition('expected', value)}
            />
          }
        />
      </Block>
    </>
  )
}
