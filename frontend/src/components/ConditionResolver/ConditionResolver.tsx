import { ConditionType } from '@types'

import { useCondition } from '@store-new'

import { BlockNew } from '../BlockNew'
import {
  Emoji,
  ExternalSource,
  Gifts,
  Jettons,
  NFT,
  Premium,
  Stickers,
  Toncoin,
  TypeSelector,
  Whitelist,
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
  premium: Premium,
  whitelist: Whitelist,
  emoji: Emoji,
  external_source: ExternalSource,
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
