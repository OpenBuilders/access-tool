import { GroupItem, Select } from '@components'
import { Condition, ConditionType } from '@types'
import { useEffect } from 'react'

import { useCondition, useConditionActions, useConditionType } from '@store-new'

import { CONDITION_TYPES_NAMES, DEFAULT_CONDITION_TYPE } from '../../constants'
import { ConditionResolverProps } from '../../types'

export const TypeSelector = (props: ConditionResolverProps) => {
  const { isNew } = props

  const conditionType = useConditionType()
  const { setConditionTypeAction, setInitialConditionAction } =
    useConditionActions()

  const options = Object.entries(CONDITION_TYPES_NAMES).map(
    ([value, label]) => ({
      value,
      label,
    })
  )

  useEffect(() => {
    setInitialConditionAction()
  }, [conditionType])

  const handleChangeType = (value: string | null) => {
    setConditionTypeAction(value as ConditionType)
    setInitialConditionAction()
  }

  return (
    <GroupItem
      text="Choose type"
      disabled={!isNew}
      after={
        <Select
          options={options}
          value={conditionType}
          onChange={(value) => {
            handleChangeType(value)
          }}
        />
      }
    />
  )
}
