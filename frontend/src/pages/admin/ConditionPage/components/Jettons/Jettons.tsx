import {
  AppSelect,
  Block,
  Image,
  List,
  ListInput,
  ListItem,
  Spinner,
  Text,
  useToast,
} from '@components'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  useCondition,
  useConditionActions,
  ConditionCategory,
  Condition,
} from '@store'

import { createDebouncedPrefetch } from '../../helpers'
import { ConditionComponentProps } from '../types'
import { Skeleton } from './Skeleton'

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
  const [isPrefetching, setIsPrefetching] = useState(!isNewCondition)
  const { showToast } = useToast()

  const [categories, setCategories] = useState<ConditionCategory[]>([])

  const debouncedPrefetchRef = useRef(createDebouncedPrefetch(1000))

  const prefetchJetton = useCallback(
    async (address?: string) => {
      if (!conditionState?.type || !address) return
      setIsPrefetching(true)
      try {
        await prefetchConditionDataAction('jetton', address)
      } catch (error) {
        console.error(error)
        showToast({
          type: 'error',
          message: 'Nothing found',
          time: 1500,
        })
        resetPrefetchedConditionDataAction()
      } finally {
        setIsPrefetching(false)
      }
    },
    [
      conditionState?.type,
      prefetchConditionDataAction,
      resetPrefetchedConditionDataAction,
      showToast,
    ]
  )

  const handleAddressChange = useCallback(
    (value: string) => {
      handleChangeCondition('address', value)

      if (!value) {
        resetPrefetchedConditionDataAction()
        return
      }

      debouncedPrefetchRef.current(value, prefetchJetton)
    },
    [handleChangeCondition, prefetchJetton, resetPrefetchedConditionDataAction]
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
    if (condition?.blockchainAddress || condition?.address) {
      prefetchJetton(condition?.blockchainAddress || condition?.address)
    }
  }, [
    condition?.blockchainAddress,
    isNewCondition,
    conditionState?.type,
    condition?.address,
    prefetchJetton,
  ])

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

  if (!categories?.length || !conditionState?.type) {
    return <Skeleton />
  }

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
            <ListItem
              after={isPrefetching ? <Spinner size={16} /> : null}
              disabled={isPrefetching}
            >
              <ListInput
                placeholder="Jetton Address"
                value={conditionState.address}
                onChange={handleAddressChange}
              />
            </ListItem>
            {prefetchedConditionData && (
              <ListItem
                disabled={isPrefetching}
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
