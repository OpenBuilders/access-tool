import { StickersCollection } from '@store'

export const getCollectionData = (
  stickers: StickersCollection[],
  collectionId: number | string
) => {
  const collection = stickers.find(
    (collection) => Number(collection.id) === Number(collectionId)
  )

  if (!collection) return null

  return collection
}

export const getCharacterData = (
  stickers: StickersCollection[],
  collectionId: number | string,
  characterId: number | string
) => {
  const collection = getCollectionData(stickers, collectionId)

  const character = collection?.characters.find(
    (character) => Number(character.id) === Number(characterId)
  )

  if (!character) return null

  return character
}
