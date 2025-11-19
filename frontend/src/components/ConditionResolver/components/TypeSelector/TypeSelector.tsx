import { GroupItem, Select } from '@components'
import { Condition, ConditionType } from '@types'

import { useCondition, useConditionActions } from '@store-new'

import { CONDITION_TYPES_NAMES, DEFAULT_CONDITION_TYPE } from '../../constants'
import { ConditionResolverProps } from '../../types'

export const TypeSelector = (props: ConditionResolverProps) => {
  const { isNew } = props

  const condition = useCondition()
  const { updateConditionAction } = useConditionActions()

  const options = Object.entries(CONDITION_TYPES_NAMES).map(
    ([value, label]) => ({
      value,
      label,
    })
  )

  const handleChangeType = (field: keyof Condition, value?: string) => {
    updateConditionAction({
      [field]: value,
    })
  }

  return (
    <GroupItem
      text="Choose type"
      disabled={!isNew}
      after={
        <Select
          options={options}
          value={condition?.type || DEFAULT_CONDITION_TYPE}
          onChange={(value) => {
            handleChangeType('type', value)
          }}
        />
      }
    />
  )
}
