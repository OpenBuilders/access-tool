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
  ConditionCategory,
  Condition,
} from '@store'

import { ConditionComponentProps } from '../types'

export const Jettons = ({
  isNewCondition,
  handleChangeCondition,
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

  const prefetchJetton = async (address: string) => {
    if (!conditionState?.type) return

    try {
      await prefetchConditionDataAction('jetton', address)
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
    [conditionState?.address, conditionState?.blockchainAddress]
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
    if (
      !isNewCondition &&
      conditionState?.blockchainAddress &&
      !prefetchedConditionData
    ) {
      prefetchJetton(conditionState?.blockchainAddress)
    }
  }, [conditionState, isNewCondition])

  useEffect(() => {
    fetchConditionCategories()
    if (isNewCondition) {
      resetPrefetchedConditionDataAction()
    }
  }, [])

  useEffect(() => {
    if (categories?.length) {
      let updatedConditionState: Partial<Condition> = {
        type: 'jetton',
        asset: condition?.asset || categories[0].asset,
        category: condition?.category || categories[0].categories[0],
        address: condition?.blockchainAddress || condition?.address || '',
        expected: condition?.expected || '',
      }

      if (!isNewCondition) {
        updatedConditionState = {
          ...updatedConditionState,
          isEnabled: !!condition?.isEnabled || true,
        }
      }

      setInitialState(updatedConditionState as Partial<Condition>)
    }
  }, [categories?.length, condition, isNewCondition])

  if (!categories?.length || !conditionState?.type) return null

  return (
    <>
      <Block margin="top" marginValue={24}>
        <List>
          <ListItem
            text="Category"
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
                value={conditionState.address}
                onChange={(value) => {
                  handleChangeCondition('address', value)
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
