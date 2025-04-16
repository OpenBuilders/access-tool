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
import { validateJettonsCondition } from './helpers'

export const Jettons = ({
  isNewCondition,
  handleChangeCondition,
  toggleIsValid,
  conditionState,
  setInitialState,
  condition,
}: ConditionComponentProps) => {
  const {
    fetchConditionCategoriesAction,
    prefetchConditionDataAction,
    resetPrefetchedConditionDataAction,
  } = useConditionActions()
  const { prefetchedConditionData } = useCondition()

  const [categories, setCategories] = useState<ConditionCategory[]>([])
  const addressField = isNewCondition ? 'address' : 'blockchainAddress'

  const prefetchJetton = async (address: string) => {
    try {
      await prefetchConditionDataAction(
        conditionState?.type as ConditionType,
        address
      )
    } catch (error) {
      console.error(error)
      resetPrefetchedConditionDataAction()
    }
  }

  const debouncedPrefetchJetton = useCallback(
    debounce(async (address?: string) => {
      if (!address) {
        resetPrefetchedConditionDataAction()
        return
      }

      prefetchJetton(address)
    }, 150),
    []
  )

  const fetchConditionCategories = async () => {
    try {
      const result = await fetchConditionCategoriesAction('jetton')

      if (!result) {
        throw new Error('Failed to fetch condition categories')
      }

      setCategories(result)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (!isNewCondition && conditionState?.blockchainAddress) {
      prefetchJetton(conditionState?.blockchainAddress)
    }
  }, [conditionState])

  useEffect(() => {
    fetchConditionCategories()
    if (isNewCondition) {
      toggleIsValid(false)
      resetPrefetchedConditionDataAction()
    }
  }, [])

  useEffect(() => {
    if (categories?.length && (isNewCondition || condition)) {
      setInitialState({
        ...conditionState,
        type: 'jetton',
        asset: condition?.asset || categories[0].asset,
        category: condition?.category || categories[0].categories[0],
        [addressField]: condition?.[addressField] || '',
        expected: condition?.expected || '',
      })
    }
  }, [categories?.length, condition])

  useEffect(() => {
    const validationResult = validateJettonsCondition(
      conditionState as Condition
    )
    toggleIsValid(validationResult)
  }, [conditionState])

  if (!categories?.length || !conditionState?.type) return null

  return (
    <>
      <Block margin="top" marginValue={24}>
        <List>
          <ListItem
            text="Category"
            after={
              <AppSelect
                onChange={(value) => handleChangeCondition('asset', value)}
                value={conditionState?.asset}
                options={categories.map((asset) => ({
                  value: asset.asset,
                  name: asset.asset,
                }))}
              />
            }
          />
          <ListItem
            text="Category Option"
            after={
              <AppSelect
                onChange={(value) => handleChangeCondition('category', value)}
                value={conditionState?.category}
                options={categories
                  ?.find((asset) => asset.asset === conditionState?.asset)
                  ?.categories.map((category) => ({
                    value: category,
                    name: category,
                  }))}
              />
            }
          />
        </List>
        <Block margin="top" marginValue={24}>
          <List footer="TON (The Open Network)">
            <ListItem>
              <ListInput
                placeholder="Jetton Address"
                value={conditionState[addressField]}
                onChange={(value) => {
                  handleChangeCondition(addressField, value)
                  debouncedPrefetchJetton(value)
                }}
              />
            </ListItem>
            {prefetchedConditionData && (
              <ListItem
                before={
                  <Image
                    src={prefetchedConditionData?.logoPath}
                    size={40}
                    borderRadius={8}
                  />
                }
                text={
                  <Text type="text" weight="medium">
                    {prefetchedConditionData?.name}
                  </Text>
                }
                description={
                  <Text type="caption" color="tertiary">
                    {prefetchedConditionData?.symbol}
                  </Text>
                }
              />
            )}
          </List>
        </Block>
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
                prefetchedConditionData ? (
                  <Text type="text" color="tertiary">
                    {prefetchedConditionData?.symbol}
                  </Text>
                ) : null
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
