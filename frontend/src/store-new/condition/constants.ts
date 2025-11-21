import { ConditionType } from '@types'

export const CONDITION_INITIAL_STATE = {
  type: ConditionType.JETTON,
  expected: 0,
  category: null,
  groupId: null,
  isEnabled: true,
  address: null,
  asset: null,
  emojiId: null,
  collectionId: null,
  characterId: null,
  collectionSlug: null,
  model: null,
  backdrop: null,
  pattern: null,
  users: null,
  name: null,
  description: null,
  url: null,
  authKey: null,
  authValue: null,
}

// export const CONDITION_INITIAL_STATE: Record<ConditionType, ConditionToSend> = {
//   whitelist: {
//     name: '',
//     description: '',
//     groupId: 0,
//     users: [],
//     isEnabled: true,
//   },
//   external_source: {
//     name: '',
//     description: '',
//     groupId: 0,
//     url: '',
//     authKey: '',
//     authValue: '',
//     isEnabled: true,
//   },
//   premium: {
//     isEnabled: true,
//   },
// }
