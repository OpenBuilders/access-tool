import { ConditionGiftsPrefetch, ConditionGiftsPrefetchItem } from '@types'

export const getCollectionData = (
  collections: ConditionGiftsPrefetch,
  collectionSlug: string
) => {
  return (
    collections?.collections?.find(
      (collection) => collection.slug === collectionSlug
    ) || null
  )
}

export const getModelData = (
  collection: ConditionGiftsPrefetchItem | null,
  conditionModel: string | null
) => {
  return collection?.models?.find((model) => model === conditionModel) || null
}

export const getBackdropData = (
  collection: ConditionGiftsPrefetchItem | null,
  conditionBackdrop: string | null
) => {
  return (
    collection?.backdrops?.find((backdrop) => backdrop === conditionBackdrop) ||
    null
  )
}

export const getPatternData = (
  collection: ConditionGiftsPrefetchItem | null,
  conditionPattern: string | null
) => {
  return (
    collection?.patterns?.find((pattern) => pattern === conditionPattern) ||
    null
  )
}
