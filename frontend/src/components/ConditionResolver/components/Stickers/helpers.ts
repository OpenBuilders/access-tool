import { ConditionStickersCollection } from '@types'

export const getCollectionData = (
  collections: ConditionStickersCollection[],
  collectionId: number | string
) => {
  return (
    collections.find(
      (collection) => collection.id.toString() === collectionId.toString()
    ) || null
  )
}

export const getCharacterData = (
  collection: ConditionStickersCollection | null,
  characterId: number | string
) => {
  return (
    collection?.characters.find(
      (character) => character.id.toString() === characterId.toString()
    ) || null
  )
}
