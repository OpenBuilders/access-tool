import { ConditionType } from '@types'

import { useCondition, useConditionType } from '@store-new'

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
  const { isNew } = props
  const conditionType = useConditionType()

  const ConditionTypeComponent =
    CONDITION_COMPONENTS[conditionType as keyof typeof CONDITION_COMPONENTS]

  return (
    <BlockNew padding="24px 0 0 0">
      <TypeSelector isNew={isNew} />
      {ConditionTypeComponent && <ConditionTypeComponent />}
    </BlockNew>
  )
}
