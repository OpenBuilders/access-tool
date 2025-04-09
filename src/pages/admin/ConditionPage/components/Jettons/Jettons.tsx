import cs from '@styles/commonStyles.module.scss'
import { Cell, Image, Input, Section, Text } from '@telegram-apps/telegram-ui'
import debounce from 'debounce'
import { useCallback, useEffect } from 'react'

import config from '@config'
import {
  useCondition,
  useConditionActions,
  ConditionJetton,
  ConditionType,
} from '@store'

import { ConditionComponentProps } from '../types'
import { validateJettonsCondition } from './helpers'

export const Jettons = ({ isNewCondition }: ConditionComponentProps) => {
  const { condition } = useCondition()
  const { handleChangeConditionFieldAction, setIsValidAction } =
    useConditionActions()

  const { prefetchedConditionData } = useCondition()
  const { prefetchConditionDataAction, resetPrefetchedConditionDataAction } =
    useConditionActions()

  const debouncedPrefetchJetton = useCallback(
    debounce(async (address: string) => {
      try {
        await prefetchConditionDataAction(
          condition?.category as ConditionType,
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
    handleChangeConditionFieldAction(field, value)

    const updatedCondition = {
      ...condition,
      category: condition?.category,
      [field]: value,
    } as ConditionJetton

    const validationResult = validateJettonsCondition(updatedCondition)

    if (field === addressField) {
      debouncedPrefetchJetton(value.toString())
    }

    setIsValidAction(validationResult)
  }

  useEffect(() => {
    if (
      !isNewCondition &&
      (condition?.blockchainAddress || (condition as ConditionJetton)?.address)
    ) {
      debouncedPrefetchJetton(
        condition?.blockchainAddress || (condition as ConditionJetton)?.address
      )
    }
  }, [])

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

  if (prefetchedConditionData) {
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
        <Cell after={<AppSelect options={JETTONS_CATEGORIES} />}>Category</Cell>
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
              after={
                <Text className={cs.colorHint}>
                  {prefetchedConditionData?.symbol || ''}
                </Text>
              }
              value={(condition as ConditionJetton)?.expected}
              onChange={(e) =>
                handleChangeConditionField('expected', e.target.value)
              }
            />
          }
        >
          Amount
        </Cell>
      </Section>
    </>
  )
}
