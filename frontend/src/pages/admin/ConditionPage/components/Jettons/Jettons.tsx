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
} from '@store'

import { ConditionComponentProps } from '../types'
import { validateJettonsCondition } from './helpers'

export const Jettons = ({ isNewCondition }: ConditionComponentProps) => {
  const { condition } = useCondition()

  const [categoriesData, setCategoriesData] = useState<any>(null)

  const [activeAsset, setActiveAsset] = useState<any>(null)
  const [activeCategory, setActiveCategory] = useState<any>(null)

  const { prefetchedConditionData } = useCondition()
  const {
    prefetchConditionDataAction,
    resetPrefetchedConditionDataAction,
    setIsValidAction,
    fetchConditionCategoriesAction,
    handleChangeConditionFieldAction,
  } = useConditionActions()

  const debouncedPrefetchJetton = useCallback(
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
        resetPrefetchedConditionDataAction()
      }
    }, 250),
    []
  )

  const addressField = isNewCondition ? 'address' : 'blockchainAddress'

  const handleChangeConditionField = (
    field: string,
    value: string | number
  ) => {
    const updatedState = {
      ...condition,
      [field]: value,
    }

    handleChangeConditionFieldAction(field, value)
    const validationResult = validateJettonsCondition(updatedState as Condition)

    if (field === addressField) {
      debouncedPrefetchJetton(value.toString())
    }

    if (field === 'asset') {
      setActiveAsset(value)
    }

    if (field === 'category') {
      setActiveCategory(value)
    }

    setIsValidAction(validationResult)
  }

  const fetchConditionCategories = async () => {
    try {
      const result = await fetchConditionCategoriesAction('jetton')

      if (!result) {
        throw new Error('Failed to fetch condition categories')
      }
      const categoriesDataResult = result.map((asset) => {
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
        handleChangeConditionField('asset', condition?.asset)
        setActiveAsset(condition?.asset)
      } else {
        handleChangeConditionField('asset', categoriesDataResult[0].value)
        setActiveAsset(categoriesDataResult[0].value)
      }

      if (condition?.category) {
        handleChangeConditionField('category', condition?.category)
        setActiveCategory(condition?.category)
      } else {
        handleChangeConditionField(
          'category',
          categoriesDataResult[0].categories[0].value
        )
        setActiveCategory(categoriesDataResult[0].categories[0].value)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (!isNewCondition) {
      debouncedPrefetchJetton(condition?.blockchainAddress)
    }
    fetchConditionCategories()
  }, [])

  if (!categoriesData) return null

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
        </List>
        <Block margin="top" marginValue={24}>
          <List footer="TON (The Open Network)">
            <ListItem>
              <ListInput
                placeholder="Jetton Address"
                value={condition?.[addressField] || ''}
                onChange={(value) =>
                  handleChangeConditionField(addressField, value)
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
