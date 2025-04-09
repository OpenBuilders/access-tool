import {
  INITIAL_CONDITION_JETTON,
  INITIAL_CONDITION_NFT_COLLECTION,
  INITIAL_CONDITION_WHITELIST_EXTERNAL,
} from './constants'
import { ConditionType } from './types'

export const getConditionInitialState = (type: ConditionType) => {
  const initialState = {
    jetton: INITIAL_CONDITION_JETTON,
    nft_collections: INITIAL_CONDITION_NFT_COLLECTION,
    whitelist_external: INITIAL_CONDITION_WHITELIST_EXTERNAL,
  }

  return initialState[type as keyof typeof initialState]
}
