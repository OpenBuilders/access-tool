import {
  BlockNew,
  Group,
  GroupInput,
  GroupItem,
  Image,
  Select,
  Spinner,
} from '@components'
import { ConditionJettonsToSend, ConditionType, Option } from '@types'
import { useDebounce } from '@uidotdev/usehooks'
import { useState } from 'react'

import {
  useAdminConditionCategoriesQuery,
  useAdminConditionJettonsQuery,
  useCondition,
  useConditionActions,
  useConditionType,
} from '@store-new'

export const Jettons = () => {
  const conditionType = useConditionType()
  const condition: Partial<ConditionJettonsToSend> = useCondition()
  const { updateConditionAction } = useConditionActions()

  const [jettonAddressQuery, setJettonAddressQuery] = useState(
    condition?.address || ''
  )
  const [amountQuery, setAmountQuery] = useState(condition?.expected || '')

  // Debounced значение для запроса
  const debouncedJettonAddress = useDebounce(jettonAddressQuery, 500)

  const { data: categoriesData, isPending: categoriesIsPending } =
    useAdminConditionCategoriesQuery(conditionType)

  // Используем debounced значение для запроса
  const { data: jettonsData, isLoading: jettonsIsLoading } =
    useAdminConditionJettonsQuery(conditionType, debouncedJettonAddress.trim())

  if (categoriesIsPending) {
    return <p>Loading categories...</p>
  }

  const categoryOptions = categoriesData?.[0]?.categories.map((category) => ({
    value: category,
    label: category,
  })) as Option[]

  const initialCategory =
    condition?.category || categoriesData?.[0]?.categories[0]

  const handleUpdateCondition = (
    field: keyof ConditionJettonsToSend,
    value: string | null
  ) => {
    if (field === 'address') {
      setJettonAddressQuery(value || '')
    }
    if (field === 'expected') {
      setAmountQuery(value || '')
    }
    updateConditionAction({
      [field]: value || '',
    })
  }

  return (
    <>
      <BlockNew padding="24px 0 0 0">
        <GroupItem
          text="Category"
          after={
            <Select
              options={categoryOptions}
              value={initialCategory}
              onChange={(value) => handleUpdateCondition('category', value)}
            />
          }
        />
      </BlockNew>
      <BlockNew padding="24px 0 0 0">
        <Group footer="TON (The Open Network)">
          <GroupItem
            disabled={jettonsIsLoading}
            main={
              <GroupInput
                placeholder="Jetton Address"
                value={jettonAddressQuery}
                onChange={(value) => handleUpdateCondition('address', value)}
              />
            }
            after={jettonsIsLoading ? <Spinner size={16} /> : null}
          />
          {jettonsData && (
            <GroupItem
              before={
                <Image src={jettonsData.logoPath} size={40} borderRadius={50} />
              }
              text={jettonsData.name}
            />
          )}
        </Group>
      </BlockNew>
      <BlockNew padding="24px 0 0 0">
        <GroupItem
          text="Amount"
          after={
            <GroupInput
              placeholder="0"
              postfix={jettonsData?.symbol}
              value={amountQuery.toString()}
              onChange={(value) => handleUpdateCondition('expected', value)}
            />
          }
        />
      </BlockNew>
    </>
  )
}
