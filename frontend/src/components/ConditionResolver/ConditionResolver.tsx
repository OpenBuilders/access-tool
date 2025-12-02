import { ConditionType } from '@types'
import { useParams } from 'react-router-dom'

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
  const { isNew, conditionTypeParam, conditionIsLoading } = props
  const condition = useCondition()

  const conditionType = conditionTypeParam || condition.type

  const ConditionComponent = CONDITION_COMPONENTS[conditionType]

  console.log('conditionTypeParam', conditionTypeParam)
  console.log('condition.type', condition.type)

  return (
    <BlockNew padding="24px 0 0 0">
      <TypeSelector isNew={isNew} conditionTypeParam={conditionTypeParam} />
      {ConditionComponent && (
        <ConditionComponent conditionIsLoading={conditionIsLoading} />
      )}
    </BlockNew>
  )
}
