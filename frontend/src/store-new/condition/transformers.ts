import { Condition, ConditionMutated, ConditionType } from '@types'

export const transformCondition = (condition: Condition): ConditionMutated => {
  return {
    type: condition.type as ConditionType,
    expected: condition?.expected || 0,
    category: condition?.category || null,
    groupId: condition?.groupId || null,
    isEnabled: condition?.isEnabled || true,
    address: condition?.blockchainAddress || null,
    asset: condition?.asset || null,
    emojiId: condition?.emojiId || null,
    collectionId: condition?.collection?.id || null,
    characterId: condition?.character?.id || null,
    collectionSlug: condition?.collection?.slug || null,
    model: condition?.model || null,
    backdrop: condition?.backdrop || null,
    pattern: condition?.pattern || null,
    users: condition?.users || [],
    name: condition?.title || null,
    description: condition?.description || null,
    url: condition?.url || null,
    authKey: condition?.authKey || null,
    authValue: condition?.authValue || null,
  }
}

// import { Condition, ConditionToSend, ConditionType } from '@types'

// /**
//  * Преобразует Condition (из GET) в ConditionToSend (для POST/PUT)
//  */
// export const transformConditionToSend = (
//   type: ConditionType,
//   condition?: Partial<Condition>
// ): Partial<ConditionToSend> => {
//   const base = {
//     groupId: condition?.groupId || null,
//     type: type,
//   }

//   switch (type) {
//     case 'jetton':
//       return {
//         ...base,
//         asset: condition?.asset || null,
//         expected: condition?.expected || 0,
//         category: condition?.category || '',
//         address: condition?.blockchainAddress,
//       } as ConditionToSend

//     case 'nft_collection':
//       return {
//         ...base,
//         expected: condition?.expected || 0,
//         category: condition?.category || '',
//         address: condition?.blockchainAddress,
//         asset: condition?.asset || '',
//       } as ConditionToSend

//     case 'toncoin':
//       return {
//         ...base,
//         expected: condition?.expected || 0,
//         category: condition?.category || '',
//       } as ConditionToSend

//     case 'emoji':
//       return {
//         ...base,
//         emojiId: condition?.emojiId || '',
//       } as ConditionToSend

//     case 'sticker_collection':
//       return {
//         ...base,
//         expected: condition?.expected || 0,
//         category: condition?.category || '',
//         collectionId: condition?.collection?.id || 0,
//         characterId: condition?.character?.id || 0,
//       } as ConditionToSend

//     case 'gift_collection':
//       return {
//         ...base,
//         expected: condition?.expected || 0,
//         category: condition?.category || '',
//         collectionSlug: condition?.collection?.slug || '',
//         model: condition?.model || '',
//         backdrop: condition?.backdrop || null,
//         pattern: condition?.pattern || null,
//       } as ConditionToSend

//     case 'whitelist':
//       return {
//         ...base,
//         name: condition?.title || '',
//         description: condition?.title || '', // или другое поле, если есть
//         users: [], // нужно получить из API
//       } as ConditionToSend

//     case 'external_source':
//       return {
//         ...base,
//         name: condition?.title || '',
//         description: condition?.title || '',
//         url: condition?.promoteUrl || '',
//         authKey: condition?.authKey || '',
//         authValue: condition?.authValue || '',
//       } as ConditionToSend

//     case 'premium':
//       return {
//         ...base,
//         isEnabled: condition?.isEnabled || true,
//       } as ConditionToSend

//     default:
//       return base
//   }
// }

// /**
//  * Преобразует ConditionToSend в формат для API (если нужны дополнительные трансформации)
//  */
// export const transformConditionForAPI = (
//   condition: Partial<ConditionToSend>,
//   type: ConditionType
// ): Partial<ConditionToSend> => {
//   // Здесь можно добавить валидацию и дополнительные трансформации
//   // Например, убрать пустые поля, преобразовать типы и т.д.
//   return condition
// }

// /**
//  * Для создания - может потребоваться другая логика
//  */
// export const transformConditionForCreate = (
//   condition: Partial<ConditionToSend>,
//   type: ConditionType
// ): Partial<ConditionToSend> => {
//   // Логика для создания (например, убрать id, установить дефолтные значения)
//   const { ...rest } = condition
//   return rest
// }

// /**
//  * Для обновления - может потребоваться другая логика
//  */
// export const transformConditionForUpdate = (
//   condition: Partial<ConditionToSend>,
//   type: ConditionType,
//   originalCondition?: Condition
// ): Partial<ConditionToSend> => {
//   // Логика для обновления (например, отправить только измененные поля)
//   return condition
// }
