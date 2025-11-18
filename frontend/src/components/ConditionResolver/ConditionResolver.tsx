import { useCondition } from '@store-new'

import { BlockNew } from '../BlockNew'
import { Jettons, TypeSelector } from './components'
import { DEFAULT_CONDITION_TYPE } from './constants'
import { ConditionResolverProps } from './types'

const CONDITION_COMPONENTS = {
  jetton: Jettons,
}

export const ConditionResolver = (props: ConditionResolverProps) => {
  const condition = useCondition()

  const ConditionTypeComponent =
    CONDITION_COMPONENTS[
      (condition?.type as keyof typeof CONDITION_COMPONENTS) ||
        DEFAULT_CONDITION_TYPE
    ]

  return (
    <BlockNew padding="24px 0 0 0">
      <TypeSelector />
      {ConditionTypeComponent && (
        <BlockNew padding="24px 0 0 0">
          <ConditionTypeComponent />
        </BlockNew>
      )}
    </BlockNew>
  )
}
