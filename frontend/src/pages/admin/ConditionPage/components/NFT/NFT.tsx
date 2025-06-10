import {
  AppSelect,
  Block,
  Image,
  List,
  ListInput,
  ListItem,
  Spinner,
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

export const NFT = ({
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
  const [isPrefetching, setIsPrefetching] = useState(false)
  const { showToast } = useToast()

  const [categories, setCategories] = useState<ConditionCategory[]>([])

  const debouncedPrefetchRef = useRef(createDebouncedPrefetch(1000))

  const prefetchNFTCollection = useCallback(
    async (address: string) => {
      if (!conditionState?.type) return
      setIsPrefetching(true)
      try {
        await prefetchConditionDataAction('nft_collection', address)
      } catch (error) {
        console.error(error)
        resetPrefetchedConditionDataAction()
        showToast({
          type: 'error',
          message: 'Nothing found',
          time: 1500,
        })
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

      debouncedPrefetchRef.current(value, prefetchNFTCollection)
    },
    [
      handleChangeCondition,
      prefetchNFTCollection,
      resetPrefetchedConditionDataAction,
    ]
  )

  const handleCollectionChange = useCallback(
    (value: string) => {
      if (value === 'Any') {
        handleChangeCondition('category', null)
        handleChangeCondition('asset', null)
        handleChangeCondition('address', '')
        handleChangeCondition('blockchainAddress', '')
        resetPrefetchedConditionDataAction()
      } else {
        handleChangeCondition('asset', value)
        const category = categories.find((asset) => asset.asset === value)
        handleChangeCondition('category', category?.categories[0])
        handleChangeCondition('address', null)
        handleChangeCondition('blockchainAddress', undefined)
      }
    },
    [categories, handleChangeCondition, resetPrefetchedConditionDataAction]
  )

  const handleCategoryChange = useCallback(
    (value: string) => {
      if (value === 'any') {
        handleChangeCondition('category', null)
      } else {
        handleChangeCondition('category', value)
      }
    },
    [handleChangeCondition]
  )

  const fetchConditionCategories = async () => {
    try {
      const result = await fetchConditionCategoriesAction('nft_collection')

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
      (conditionState?.blockchainAddress || conditionState?.address) &&
      !prefetchedConditionData &&
      !conditionState.asset &&
      !conditionState.category
    ) {
      prefetchNFTCollection(
        conditionState?.blockchainAddress || conditionState?.address || ''
      )
    }
  }, [
    conditionState,
    isNewCondition,
    prefetchedConditionData,
    prefetchNFTCollection,
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
        type: 'nft_collection',
        asset: condition?.asset || undefined,
        category: condition?.category || undefined,
        address: condition?.blockchainAddress || condition?.address || '',
        expected: condition?.expected || '',
      }

      if (condition?.asset) {
        delete updatedConditionState.address
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

  const renderAddressField = !conditionState.asset
  const renderOptionField = !!conditionState.asset

  return (
    <>
      <Block margin="top" marginValue={24}>
        <List>
          <ListItem
            text="Collection"
            after={
              <AppSelect
                onChange={handleCollectionChange}
                value={conditionState?.asset}
                options={[
                  {
                    value: 'Any',
                    name: 'Any',
                  },
                  ...categories.map((asset) => ({
                    value: asset.asset,
                    name: asset.asset,
                  })),
                ]}
              />
            }
          />
          {renderOptionField && (
            <ListItem
              text="Category"
              after={
                <AppSelect
                  onChange={handleCategoryChange}
                  value={conditionState?.category || 'any'}
                  options={categories
                    .find((asset) => asset.asset === conditionState?.asset)
                    ?.categories?.map((category) => ({
                      value: category || 'any',
                      name: category || 'Any',
                    }))}
                />
              }
            />
          )}
        </List>
        {renderAddressField && (
          <Block margin="top" marginValue={24}>
            <List footer="TON (The Open Network)">
              <ListItem
                after={isPrefetching ? <Spinner size={16} /> : null}
                disabled={isPrefetching}
              >
                <ListInput
                  placeholder="NFT Collection Address"
                  value={conditionState?.address || ''}
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
                  text={prefetchedConditionData?.name}
                  description={prefetchedConditionData?.symbol}
                />
              )}
            </List>
          </Block>
        )}
      </Block>
      <Block margin="top" marginValue={24}>
        <ListItem
          text="# of NFTs"
          after={
            <ListInput
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              textColor="tertiary"
              value={conditionState?.expected}
              onChange={(value) => handleChangeCondition('expected', value)}
            />
          }
        />
      </Block>
    </>
  )
}
