import { AppSelect } from '@components'
import cs from '@styles/commonStyles.module.scss'
import { Cell, Image, Input, Section, Text } from '@telegram-apps/telegram-ui'
import debounce from 'debounce'
import { useState, useCallback, useEffect } from 'react'

import config from '@config'
import {
  useCondition,
  useConditionActions,
  ConditionJetton,
  ConditionNFTCollection,
  ConditionType,
} from '@store'

import { ConditionComponentProps } from '../types'
import { NFT_COLLECTIONS } from './constants'
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

  let AddressComponent = (
    <Section className={cs.mt24} footer="TON (The Open Network)">
      <Input
        placeholder="Jetton Address"
        value={(condition as ConditionJetton)?.address || ''}
        onChange={(e) => handleChangeConditionField('address', e.target.value)}
      />
    </Section>
  )

  if (prefetchedConditionData) {
    AddressComponent = (
      <Section className={cs.mt24} footer="TON (The Open Network)">
        <Input
          placeholder="Jetton Address"
          value={(condition as ConditionJetton)?.address || ''}
          onChange={(e) =>
            handleChangeConditionField('address', e.target.value)
          }
        />
        <Cell
          before={
            <Image src={`${config.CDN}/${prefetchedConditionData.logoPath}`} />
          }
          subtitle={prefetchedConditionData.symbol}
        >
          {prefetchedConditionData.name}
        </Cell>
      </Section>
    )
  }

  return (
    <>
      {/* <Section className={cs.mt24}>
        <Cell after={<AppSelect options={NFT_COLLECTIONS} />}>
          NFT Collection
        </Cell>
      </Section> */}
      {AddressComponent}
      <Section className={cs.mt24}>
        <Cell
          after={
            <Input
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              className={cs.afterInput}
              after={<Text className={cs.colorHint}>TON</Text>}
              value={(condition as ConditionJetton)?.expected}
              onChange={(e) =>
                handleChangeConditionField('expected', e.target.value)
              }
            />
          }
        >
          # of NFTs
        </Cell>
      </Section>
    </>
  )
}
