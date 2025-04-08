import { AppSelect } from '@components'
import cs from '@styles/commonStyles.module.scss'
import { Cell, Image, Input, Section, Text } from '@telegram-apps/telegram-ui'
import debounce from 'debounce'
import { useState, useCallback } from 'react'

import config from '@config'
import {
  PrefetchJetton,
  useCondition,
  useConditionActions,
  ConditionJetton,
  ConditionNFTCollection,
} from '@store'

import { NFT_COLLECTIONS } from './constants'
import { validateNFTCollectionCondition } from './helpers'

export const NFT = () => {
  const { condition } = useCondition()
  const {
    handleChangeConditionFieldAction,
    prefetchNFTCollectionAction,
    setIsValidAction,
  } = useConditionActions()

  const [prefetchNFTCollection, setPrefetchNFTCollection] = useState<
    any | null
  >(null)

  const debouncedPrefetchNFTCollection = useCallback(
    debounce(async (address: string) => {
      try {
        const nftCollection = await prefetchNFTCollectionAction(address)
        if (!nftCollection) return
        setPrefetchNFTCollection(nftCollection)
      } catch (error) {
        console.error(error)
        setPrefetchNFTCollection(null)
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

  let AddressComponent = (
    <Section className={cs.mt24} footer="TON (The Open Network)">
      <Input
        placeholder="Jetton Address"
        value={(condition as ConditionJetton)?.address || ''}
        onChange={(e) => handleChangeConditionField('address', e.target.value)}
      />
    </Section>
  )

  if (prefetchNFTCollection) {
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
            <Image src={`${config.CDN}/${prefetchNFTCollection.logoPath}`} />
          }
          subtitle={prefetchNFTCollection.symbol}
        >
          {prefetchNFTCollection.name}
        </Cell>
      </Section>
    )
  }

  return (
    <>
      <Section className={cs.mt24}>
        <Cell after={<AppSelect options={NFT_COLLECTIONS} />}>
          NFT Collection
        </Cell>
      </Section>
      {AddressComponent}
      <Section className={cs.mt24}>
        <Cell
          after={
            <Input
              type="number"
              className={cs.afterInput}
              after={<Text className={cs.colorHint}>TON</Text>}
              value={(condition as ConditionJetton)?.expected || 0}
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
