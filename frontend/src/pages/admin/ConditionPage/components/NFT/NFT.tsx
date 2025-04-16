import { AppSelect, Block, Image, List, ListInput, ListItem } from '@components'
import debounce from 'debounce'
import { useCallback, useEffect, useState } from 'react'

import {
  useCondition,
  useConditionActions,
  Condition,
  ConditionCategory,
} from '@store'

import { ConditionComponentProps } from '../types'
import { validateNFTCollectionCondition } from './helpers'

export const NFT = ({
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
  // const addressField = isNewCondition ? 'address' : 'blockchainAddress'

  const prefetchNFTCollection = async (address: string) => {
    try {
      await prefetchConditionDataAction('nft_collection', address)
    } catch (error) {
      console.error(error)
      resetPrefetchedConditionDataAction()
    }
  }

  const debouncedPrefetchNFTCollection = useCallback(
    debounce(async (address?: string) => {
      if (!address) {
        resetPrefetchedConditionDataAction()
        return
      }

      prefetchNFTCollection(address)
    }, 150),
    []
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
      (conditionState?.blockchainAddress || conditionState?.address)
    ) {
      prefetchNFTCollection(
        conditionState?.blockchainAddress || conditionState?.address || ''
      )
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
        type: 'nft_collection',
        asset: condition?.asset || undefined,
        category: condition?.category || undefined,
        address: condition?.blockchainAddress || condition?.address || '',
        expected: condition?.expected || '',
      })
    }
  }, [categories?.length, condition])

  useEffect(() => {
    const validationResult = validateNFTCollectionCondition(
      conditionState as Condition
    )
    toggleIsValid(validationResult)
  }, [conditionState])

  if (!categories?.length || !conditionState?.type) return null

  const renderAddressField = !conditionState.asset
  const renderOptionField = !!conditionState.asset
  const optionFieldText =
    conditionState.asset === 'Telegram Gifts' ? 'Collection' : 'Length'

  return (
    <>
      <Block margin="top" marginValue={24}>
        <List>
          <ListItem
            text="Category"
            after={
              <AppSelect
                onChange={(value) => {
                  handleChangeCondition('asset', value)
                  const category = categories.find(
                    (asset) => asset.asset === value
                  )
                  handleChangeCondition('category', category?.categories[0])
                  if (value === 'Any') {
                    handleChangeCondition('category', undefined)
                    handleChangeCondition('asset', undefined)
                    handleChangeCondition('address', '')
                    handleChangeCondition('blockchainAddress', '')
                    resetPrefetchedConditionDataAction()
                  } else {
                    handleChangeCondition('address', undefined)
                    handleChangeCondition('blockchainAddress', undefined)
                  }
                }}
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
              text={optionFieldText}
              after={
                <AppSelect
                  onChange={(value) => handleChangeCondition('category', value)}
                  value={conditionState?.category}
                  options={categories
                    .find((asset) => asset.asset === conditionState?.asset)
                    ?.categories?.map((category) => ({
                      value: category,
                      name: category,
                    }))}
                />
              }
            />
          )}
        </List>
        {renderAddressField && (
          <Block margin="top" marginValue={24}>
            <List footer="TON (The Open Network)">
              <ListItem>
                <ListInput
                  placeholder="NFT Collection Address"
                  value={conditionState?.address || ''}
                  onChange={(value) => {
                    handleChangeCondition('address', value)
                    debouncedPrefetchNFTCollection(value)
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
