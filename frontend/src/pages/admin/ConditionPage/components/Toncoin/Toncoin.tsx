import {
  AppSelect,
  Block,
  Image,
  List,
  ListInput,
  ListItem,
  Text,
} from '@components'
import debounce from 'debounce'
import { useCallback, useEffect, useState } from 'react'

import {
  useCondition,
  useConditionActions,
  ConditionType,
  Condition,
  ConditionCategory,
} from '@store'

import { ConditionComponentProps } from '../types'
import { validateToncoinCondition } from './helpers'

export const Toncoin = ({ isNewCondition }: ConditionComponentProps) => {
  const { condition } = useCondition()

  const [categories, setCategories] = useState<any>(null)

  const { prefetchedConditionData } = useCondition()
  const {
    prefetchConditionDataAction,
    resetPrefetchedConditionDataAction,
    setIsValidAction,
    fetchConditionCategoriesAction,
    handleChangeConditionFieldAction,
  } = useConditionActions()

  const handleChangeConditionField = (
    field: string,
    value: string | number
  ) => {
    const updatedState = {
      ...condition,
      [field]: value,
    }

    handleChangeConditionFieldAction(field, value)
    const validationResult = validateToncoinCondition(updatedState as Condition)

    setIsValidAction(validationResult)
  }

  const fetchConditionCategories = async () => {
    try {
      const result = await fetchConditionCategoriesAction(
        condition?.type as ConditionType
      )

      if (!result) {
        throw new Error('Failed to fetch condition categories')
      }

      const formattedCategories = result[0]?.categories.map((category) => ({
        value: category,
        name: category,
      }))

      setCategories(formattedCategories)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchConditionCategories()
  }, [])

  if (!categories) return null

  return (
    <>
      <Block margin="top" marginValue={24}>
        <ListItem
          text="Category"
          after={
            <AppSelect
              onChange={(value) =>
                handleChangeConditionField('category', value)
              }
              options={categories}
              value={condition?.category}
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
              value={condition?.expected}
              onChange={(value) =>
                handleChangeConditionField('expected', value)
              }
            />
          }
        />
      </Block>
    </>
  )
}
