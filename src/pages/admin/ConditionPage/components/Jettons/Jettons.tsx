import { AppSelect } from '@components'
import cs from '@styles/commonStyles.module.scss'
import { Cell, Image, Input, Section, Text } from '@telegram-apps/telegram-ui'
import debounce from 'debounce'
import { useEffect, useState, useCallback } from 'react'

import config from '@config'
import {
  PrefetchJetton,
  useCondition,
  useConditionActions,
  ConditionJetton,
} from '@store'

import { ConditionComponentProps } from '../types'
import { JETTONS_CATEGORIES } from './constants'
import { validateJettonsCondition } from './helpers'

export const Jettons = ({ isNewCondition }: ConditionComponentProps) => {
  const { condition, isValid } = useCondition()
  const {
    handleChangeConditionFieldAction,
    prefetchJettonAction,
    setIsValidAction,
  } = useConditionActions()

  const [prefetchJetton, setPrefetchJetton] = useState<PrefetchJetton | null>(
    null
  )

  const debouncedPrefetchJetton = useCallback(
    debounce(async (address: string) => {
      try {
        const jetton = await prefetchJettonAction(address)
        if (!jetton) return
        setPrefetchJetton(jetton)
      } catch (error) {
        console.error(error)
        setPrefetchJetton(null)
      }
    }, 250),
    []
  )

  const addressField = isNewCondition ? 'address' : 'blockchainAddress'

  const handleChangeConditionField = (
    field: string,
    value: string | number
  ) => {
    handleChangeConditionFieldAction(field, value)

    const updatedCondition = {
      ...condition,
      [field]: value,
    } as ConditionJetton

    const validationResult = validateJettonsCondition(updatedCondition)

    if (field === addressField) {
      debouncedPrefetchJetton(value.toString())
    }

    setIsValidAction(validationResult)
  }

  let AddressComponent = (
    <Section className={cs.mt24} footer="TON (The Open Network)">
      <Input
        placeholder="Jetton Address"
        value={(condition as ConditionJetton)?.[addressField] || ''}
        onChange={(e) =>
          handleChangeConditionField(addressField, e.target.value)
        }
      />
    </Section>
  )

  if (prefetchJetton) {
    AddressComponent = (
      <Section className={cs.mt24} footer="TON (The Open Network)">
        <Input
          placeholder="Jetton Address"
          value={(condition as ConditionJetton)?.[addressField] || ''}
          onChange={(e) =>
            handleChangeConditionField(addressField, e.target.value)
          }
        />
        <Cell
          before={<Image src={`${config.CDN}/${prefetchJetton.logoPath}`} />}
          subtitle={prefetchJetton.symbol}
        >
          {prefetchJetton.name}
        </Cell>
      </Section>
    )
  }

  return (
    <>
      <Section className={cs.mt24}>
        <Cell after={<AppSelect options={JETTONS_CATEGORIES} />}>Category</Cell>
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
          Amount
        </Cell>
        <Cell>{isValid ? 'Valid' : 'Invalid'}</Cell>
      </Section>
    </>
  )
}
