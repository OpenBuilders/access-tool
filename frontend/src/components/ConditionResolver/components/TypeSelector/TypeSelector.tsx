import { GroupItem, Select } from '@components'
import { ConditionType } from '@types'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'

import {
  CONDITION_INITIAL_STATE,
  useCondition,
  useConditionActions,
} from '@store-new'

import { CONDITION_TYPES_NAMES } from '../../constants'
import { ConditionResolverProps } from '../../types'

export const TypeSelector = (props: ConditionResolverProps) => {
  const { isNew } = props

  const location = useLocation()
  const groupId = location.state?.groupId || null

  const condition = useCondition()
  const { updateConditionAction } = useConditionActions()

  const [typeQuery, setTypeQuery] = useState<ConditionType>(condition.type)

  const options = Object.entries(CONDITION_TYPES_NAMES).map(
    ([value, label]) => ({
      value,
      label,
    })
  )

  const handleChangeType = (value: string | null) => {
    setTypeQuery(value as ConditionType)
    updateConditionAction({
      ...CONDITION_INITIAL_STATE,
      type: value as ConditionType,
      groupId,
    })
  }

  return (
    <GroupItem
      text="Choose type"
      disabled={!isNew}
      after={
        <Select
          options={options}
          value={typeQuery}
          onChange={(value) => {
            handleChangeType(value)
          }}
        />
      }
    />
  )
}
