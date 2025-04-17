import { AppSelect, Block, ListInput, ListItem, Text } from '@components'
import { useEffect, useState } from 'react'

import { useConditionActions, ConditionCategory } from '@store'

import { ConditionComponentProps } from '../types'

export const Toncoin = ({
  isNewCondition,
  handleChangeCondition,
  conditionState,
  setInitialState,
  condition,
}: ConditionComponentProps) => {
  const { fetchConditionCategoriesAction, resetPrefetchedConditionDataAction } =
    useConditionActions()

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
    if (isNewCondition) {
      resetPrefetchedConditionDataAction()
    }
  }, [])

  useEffect(() => {
    if (categories?.length && (isNewCondition || condition)) {
      setInitialState({
        ...conditionState,
        type: 'toncoin',
        asset: condition?.asset || categories[0].asset,
        category: condition?.category || categories[0].categories[0],
        expected: condition?.expected || '',
      })

      if (!isNewCondition) {
        setInitialState({
          ...conditionState,
          isEnabled: !!condition?.isEnabled || true,
        })
      }
    }
  }, [categories?.length, condition])

  if (!categories?.length || !conditionState?.type) return null

  return (
    <>
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
              value={condition?.asset}
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
              onChange={(value) => handleChangeCondition('expected', value)}
            />
          }
        />
      </Block>
    </>
  )
}
