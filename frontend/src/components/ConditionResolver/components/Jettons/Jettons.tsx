import {
  BlockNew,
  Group,
  GroupInput,
  GroupItem,
  Image,
  Select,
  Spinner,
} from '@components'
import { Option } from '@types'
import { useDebounce } from '@uidotdev/usehooks'
import { useEffect, useState } from 'react'

import {
  useAdminConditionCategoriesQuery,
  useAdminConditionPrefetchQuery,
  useCondition,
  useConditionActions,
} from '@store-new'

import { JettonsSkeleton } from './Jettons.skeleton'

export const Jettons = () => {
  const condition = useCondition()
  const { updateConditionAction } = useConditionActions()

  const { data: categoriesData, isPending: categoriesIsPending } =
    useAdminConditionCategoriesQuery(condition.type)

  const [queries, setQueries] = useState({
    address: condition?.address || null,
    expected: condition?.expected || null,
    category: condition?.category || categoriesData?.[0]?.categories[0] || null,
  })

  const debouncedJettonAddress = useDebounce(queries.address, 500)

  const { data: jettonsData, isLoading: jettonsIsLoading } =
    useAdminConditionPrefetchQuery(condition.type, debouncedJettonAddress || '')

  const categoryOptions = categoriesData?.[0]?.categories.map((category) => ({
    value: category,
    label: category,
  })) as Option[]

  useEffect(() => {
    const initialCategory =
      condition?.category || categoriesData?.[0]?.categories[0]
    if (initialCategory) {
      setQueries({ ...queries, category: initialCategory })
      updateConditionAction({ category: initialCategory })
    }
  }, [categoriesData?.length])

  if (categoriesIsPending || !queries.category) {
    return <JettonsSkeleton />
  }

  const handleUpdateCategory = (value: string | null) => {
    setQueries({ ...queries, category: value })
    updateConditionAction({ category: value })
  }

  const handleUpdateAddress = (value: string | null) => {
    setQueries({ ...queries, address: value })
    updateConditionAction({ address: value })
  }

  const handleUpdateExpected = (value: string | null) => {
    setQueries({ ...queries, expected: Number(value) })
    updateConditionAction({ expected: Number(value) })
  }

  return (
    <>
      <BlockNew padding="24px 0 0 0">
        <GroupItem
          text="Category"
          after={
            <Select
              options={categoryOptions}
              value={queries.category}
              onChange={(value) => handleUpdateCategory(value)}
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
                value={queries.address || ''}
                onChange={(value) => handleUpdateAddress(value)}
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
              value={queries.expected?.toString() || ''}
              onChange={(value) => handleUpdateExpected(value)}
            />
          }
        />
      </BlockNew>
    </>
  )
}
