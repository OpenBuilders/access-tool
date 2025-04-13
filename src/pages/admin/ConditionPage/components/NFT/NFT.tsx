import { AppSelect, Block, Image, List, ListInput, ListItem } from '@components'
import debounce from 'debounce'
import { useCallback, useEffect, useState } from 'react'

import { useCondition, useConditionActions, ConditionType } from '@store'

import { ConditionComponentProps } from '../types'
import { validateNFTCollectionCondition } from './helpers'

export const NFT = ({ isNewCondition }: ConditionComponentProps) => {
  const [categoriesData, setCategoriesData] = useState<any>(null)
  const { condition, prefetchedConditionData } = useCondition()

  const [activeAsset, setActiveAsset] = useState<any>(condition?.asset || null)
  const [activeCategory, setActiveCategory] = useState<any>(
    condition?.category || null
  )

  const {
    handleChangeConditionFieldAction,
    setIsValidAction,
    prefetchConditionDataAction,
    resetPrefetchedConditionDataAction,
    fetchConditionCategoriesAction,
  } = useConditionActions()

  const debouncedPrefetchNFTCollection = useCallback(
    debounce(async (address?: string) => {
      if (!address) {
        resetPrefetchedConditionDataAction()
        return
      }

      try {
        await prefetchConditionDataAction(
          condition?.type as ConditionType,
          address
        )
      } catch (error) {
        console.error(error)
      }
    }, 250),
    []
  )

  const handleChangeConditionField = (
    field: string,
    value: string | number
  ) => {
    handleChangeConditionFieldAction(field, value)

    const updatedCondition = {
      ...condition,
      [field]: value,
    }

    const validationResult = validateNFTCollectionCondition(updatedCondition)

    if (field === 'address') {
      debouncedPrefetchNFTCollection(value.toString())
    }

    if (field === 'asset') {
      setActiveAsset(value)
    }

    if (field === 'category') {
      setActiveCategory(value)
    }

    if (value !== 'Any' || activeAsset !== 'Any') {
      setIsValidAction(true)
    } else {
      setIsValidAction(validationResult)
    }
  }

  const fetchConditionCategories = async () => {
    try {
      const result = await fetchConditionCategoriesAction('nft_collection')

      if (!result) {
        throw new Error('Failed to fetch condition categories')
      }
      let categoriesDataResult = result.map((asset) => {
        return {
          value: asset.asset,
          name: asset.asset,
          categories: asset.categories.map((category) => ({
            value: category,
            name: category,
          })),
        }
      })
      setCategoriesData(categoriesDataResult)

      if (condition?.asset) {
        setActiveAsset(condition?.asset)
      } else {
        setActiveAsset(categoriesDataResult[0].value)
      }

      if (condition?.category && condition?.asset) {
        setActiveCategory(condition?.category)
      } else {
        setActiveCategory(categoriesDataResult[0].categories[0].value)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (!isNewCondition) {
      debouncedPrefetchNFTCollection(condition?.blockchainAddress)
    }
    fetchConditionCategories()
  }, [])

  if (!categoriesData) return null

  const renderAddress = activeAsset === 'Any'
  // const renderAmount = activeAsset === 'Any' || activeAsset === 'Telegram Gifts'
  const renderCategoryOption = activeAsset !== 'Any'

  return (
    <>
      <Block margin="top" marginValue={24}>
        <List>
          <ListItem
            text="Category"
            after={
              <AppSelect
                onChange={(value) => handleChangeConditionField('asset', value)}
                value={activeAsset}
                options={categoriesData.map((asset: any) => ({
                  value: asset.value,
                  name: asset.name,
                }))}
              />
            }
          />
          {renderCategoryOption && (
            <ListItem
              text="Category Option"
              after={
                <AppSelect
                  onChange={(value) =>
                    handleChangeConditionField('category', value)
                  }
                  value={activeCategory}
                  options={categoriesData
                    .find((asset: any) => asset.value === activeAsset)
                    ?.categories.map((category: any) => ({
                      value: category.value,
                      name: category.name,
                    }))}
                />
              }
            />
          )}
        </List>
        {renderAddress && (
          <Block margin="top" marginValue={24}>
            <List footer="TON (The Open Network)">
              <ListItem>
                <ListInput
                  placeholder="NFT Collection Address"
                  value={condition?.address || ''}
                  onChange={(value) =>
                    handleChangeConditionField('address', value)
                  }
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
