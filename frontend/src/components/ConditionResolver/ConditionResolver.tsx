import { ConditionType } from '@types'

import { useCondition } from '@store-new'

import { BlockNew } from '../BlockNew'
import { Jettons, Stickers, TypeSelector } from './components'
import { DEFAULT_CONDITION_TYPE } from './constants'
import { ConditionResolverProps } from './types'

const CONDITION_COMPONENTS: Record<
  ConditionType,
  React.ComponentType<ConditionResolverProps>
> = {
  jetton: Jettons,
  sticker_collection: Stickers,
}

export const ConditionResolver = (props: ConditionResolverProps) => {
  const condition = useCondition()

  const ConditionTypeComponent =
    CONDITION_COMPONENTS[
      (condition?.type as keyof typeof CONDITION_COMPONENTS) ||
        DEFAULT_CONDITION_TYPE
    ]

  console.log(condition)

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
