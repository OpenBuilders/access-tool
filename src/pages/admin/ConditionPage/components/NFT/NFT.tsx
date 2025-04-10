import { Block, Image, List, ListInput, ListItem } from '@components'
import debounce from 'debounce'
import { useCallback, useEffect } from 'react'

import {
  useCondition,
  useConditionActions,
  ConditionJetton,
  ConditionNFTCollection,
  ConditionType,
} from '@store'

import { ConditionComponentProps } from '../types'
import { validateNFTCollectionCondition } from './helpers'

export const NFT = ({ isNewCondition }: ConditionComponentProps) => {
  const { condition, prefetchedConditionData } = useCondition()
  const {
    handleChangeConditionFieldAction,
    setIsValidAction,
    prefetchConditionDataAction,
  } = useConditionActions()

  const debouncedPrefetchNFTCollection = useCallback(
    debounce(async (address: string) => {
      try {
        await prefetchConditionDataAction(
          condition?.category as ConditionType,
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
    } as ConditionNFTCollection

    const validationResult = validateNFTCollectionCondition(updatedCondition)

    if (field === 'address') {
      debouncedPrefetchNFTCollection(value.toString())
    }

    setIsValidAction(validationResult)
  }

  useEffect(() => {
    if (
      !isNewCondition &&
      (condition?.blockchainAddress ||
        (condition as ConditionNFTCollection)?.address)
    ) {
      debouncedPrefetchNFTCollection(
        condition?.blockchainAddress ||
          (condition as ConditionNFTCollection)?.address
      )
    }
  }, [])

  return (
    <>
      <Block margin="top" marginValue={24}>
        <List footer="TON (The Open Network)">
          <ListItem>
            <ListInput
              placeholder="NFT Collection Address"
              value={(condition as ConditionJetton)?.address || ''}
              onChange={(value) => handleChangeConditionField('address', value)}
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
      <Block margin="top" marginValue={24}>
        <ListItem
          text="# of NFTs"
          after={
            <ListInput
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              textColor="tertiary"
              value={(condition as ConditionJetton)?.expected}
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
