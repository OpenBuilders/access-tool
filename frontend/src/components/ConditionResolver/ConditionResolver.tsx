import { ConditionType } from '@types'

import { useCondition } from '@store-new'

import { BlockNew } from '../BlockNew'
import {
  Gifts,
  Jettons,
  NFT,
  Stickers,
  Toncoin,
  TypeSelector,
} from './components'
import { ConditionResolverProps } from './types'

const CONDITION_COMPONENTS: Record<
  ConditionType,
  React.ComponentType<ConditionResolverProps>
> = {
  jetton: Jettons,
  toncoin: Toncoin,
  nft_collection: NFT,
  sticker_collection: Stickers,
  gift_collection: Gifts,
}

export const ConditionResolver = (props: ConditionResolverProps) => {
  const { isNew } = props
  const condition = useCondition()

  const ConditionComponent =
    CONDITION_COMPONENTS[condition.type as keyof typeof CONDITION_COMPONENTS]

  return (
    <BlockNew padding="24px 0 0 0">
      <TypeSelector isNew={isNew} />
      {ConditionComponent && <ConditionComponent />}
    </BlockNew>
  )
}
