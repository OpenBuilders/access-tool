import { Block, Image, List, ListInput, ListItem, Text } from '@components'
import debounce from 'debounce'
import { useCallback, useEffect } from 'react'

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
    handleChangeConditionFieldAction(field, value)

    const updatedCondition = {
      ...condition,
      category: condition?.type,
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

  return (
    <>
      <Block margin="top" marginValue={24}>
        <List footer="TON (The Open Network)">
          <ListItem>
            <ListInput
              placeholder="Jetton Address"
              value={(condition as ConditionJetton)?.[addressField] || ''}
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
      {/* TODO: добавить after */}
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
