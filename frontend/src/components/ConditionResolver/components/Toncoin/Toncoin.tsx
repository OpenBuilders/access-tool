import { BlockNew, GroupInput, GroupItem, Select } from '@components'
import { Option } from '@types'
import { useEffect, useState } from 'react'

import {
  useAdminConditionCategoriesQuery,
  useCondition,
  useConditionActions,
} from '@store-new'

import { ConditionResolverProps } from '../../types'
import { ToncoinSkeleton } from './Toncoin.skeleton'

export const Toncoin = (props: ConditionResolverProps) => {
  const { conditionIsLoading } = props

  const condition = useCondition()
  const { updateConditionAction } = useConditionActions()

  const { data: categoriesData, isPending: categoriesIsPending } =
    useAdminConditionCategoriesQuery(condition.type)

  const [queries, setQueries] = useState({
    expected: condition?.expected || null,
    category: condition?.category || categoriesData?.[0]?.categories[0] || null,
  })

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

  if (conditionIsLoading || categoriesIsPending || !queries.category) {
    return <ToncoinSkeleton />
  }

  const handleUpdateCategory = (value: string | null) => {
    setQueries({ ...queries, category: value })
    updateConditionAction({ category: value })
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
        <GroupItem
          text="Amount"
          after={
            <GroupInput
              placeholder="0"
              postfix="TON"
              value={queries.expected?.toString() || ''}
              onChange={(value) => handleUpdateExpected(value)}
            />
          }
        />
      </BlockNew>
    </>
  )
}
