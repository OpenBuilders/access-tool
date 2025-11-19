import { Condition, ConditionToSend, ConditionType } from '@types'

/**
 * Преобразует Condition (из GET) в ConditionToSend (для POST/PUT)
 */
export const transformConditionToSend = (
  type: ConditionType,
  condition?: Partial<Condition>
): Partial<ConditionToSend> => {
  const base = {
    groupId: condition?.groupId || 0,
    isEnabled: condition?.isEnabled || true,
  }

  switch (type) {
    case 'jetton':
      return {
        ...base,
        expected: condition?.expected || 0,
        category: condition?.category || '',
        address: condition?.blockchainAddress,
      } as ConditionToSend

    case 'nft_collection':
      return {
        ...base,
        expected: condition?.expected || 0,
        category: condition?.category || '',
        address: condition?.blockchainAddress,
        asset: condition?.asset || '',
      } as ConditionToSend

    case 'toncoin':
      return {
        ...base,
        expected: condition?.expected || 0,
        category: condition?.category || '',
      } as ConditionToSend

    case 'emoji':
      return {
        ...base,
        emojiId: condition?.emojiId || '',
      } as ConditionToSend

    case 'sticker_collection':
      return {
        ...base,
        expected: condition?.expected || 0,
        category: condition?.category || '',
        collectionId: condition?.collection?.id || 0,
        characterId: condition?.character?.id || 0,
      } as ConditionToSend

    case 'gift_collection':
      return {
        ...base,
        expected: condition?.expected || 0,
        category: condition?.category || '',
        collectionSlug: condition?.collection?.slug || '',
        model: condition?.model || '',
        backdrop: condition?.backdrop || null,
        pattern: condition?.pattern || null,
      } as ConditionToSend

    case 'whitelist':
      return {
        ...base,
        name: condition?.title || '',
        description: condition?.title || '', // или другое поле, если есть
        users: [], // нужно получить из API
      } as ConditionToSend

    case 'external_source':
      return {
        ...base,
        name: condition?.title || '',
        description: condition?.title || '',
        url: condition?.promoteUrl || '',
        authKey: condition?.authKey || '',
        authValue: condition?.authValue || '',
      } as ConditionToSend

    case 'premium':
      return {
        ...base,
      } as ConditionToSend

    default:
      return base
  }
}

/**
 * Преобразует ConditionToSend в формат для API (если нужны дополнительные трансформации)
 */
export const transformConditionForAPI = (
  condition: Partial<ConditionToSend>,
  type: ConditionType
): Partial<ConditionToSend> => {
  // Здесь можно добавить валидацию и дополнительные трансформации
  // Например, убрать пустые поля, преобразовать типы и т.д.
  return condition
}

/**
 * Для создания - может потребоваться другая логика
 */
export const transformConditionForCreate = (
  condition: Partial<ConditionToSend>,
  type: ConditionType
): Partial<ConditionToSend> => {
  // Логика для создания (например, убрать id, установить дефолтные значения)
  const { ...rest } = condition
  return rest
}

/**
 * Для обновления - может потребоваться другая логика
 */
export const transformConditionForUpdate = (
  condition: Partial<ConditionToSend>,
  type: ConditionType,
  originalCondition?: Condition
): Partial<ConditionToSend> => {
  // Логика для обновления (например, отправить только измененные поля)
  return condition
}
