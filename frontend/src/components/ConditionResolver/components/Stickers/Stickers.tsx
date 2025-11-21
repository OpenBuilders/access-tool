import {
  BlockNew,
  Group,
  GroupInput,
  GroupItem,
  Image,
  Select,
} from '@components'
import { ConditionStickersCharacter, ConditionStickersCollection } from '@types'
import { useEffect, useState } from 'react'

import {
  useAdminConditionStickersQuery,
  useCondition,
  useConditionActions,
} from '@store-new'

import { ANY_OPTION } from '../../constants'
import { getCharacterData, getCollectionData } from './helpers'

export const Stickers = () => {
  const condition = useCondition()
  const { updateConditionAction } = useConditionActions()

  const [queries, setQueries] = useState({
    collection: null as ConditionStickersCollection | null,
    character: null as ConditionStickersCharacter | null,
    expected: condition?.expected || '',
  })

  const { data: stickersData, isPending: stickersIsPending } =
    useAdminConditionStickersQuery()

  useEffect(() => {
    if (stickersData?.length) {
      const currentCollection = getCollectionData(
        stickersData,
        condition?.collectionId || ''
      )

      const currentCharacter = getCharacterData(
        currentCollection,
        condition?.characterId || ''
      )
      setQueries({
        ...queries,
        collection: currentCollection,
        character: currentCharacter,
      })
    }
  }, [stickersData?.length])

  if (stickersIsPending) {
    return <p>Loading stickers...</p>
  }

  const collectionOptions =
    stickersData?.map((collection) => ({
      value: collection.id.toString(),
      label: collection.title,
      image: collection.logoUrl,
    })) || []

  const characterOptions =
    queries.collection?.characters?.map((character) => ({
      value: character.id.toString(),
      label: character.name,
      image: character.logoUrl,
    })) || []

  const handleUpdateCollection = (value: string | null) => {
    if (!value) {
      setQueries({ ...queries, collection: null, character: null })
      updateConditionAction({ collectionId: null, characterId: null })
      return
    }
    const currentCollection = getCollectionData(stickersData || [], value)
    setQueries({ ...queries, collection: currentCollection, character: null })
    updateConditionAction({ collectionId: Number(value), characterId: null })
  }

  const handleUpdateCharacter = (value: string | null) => {
    if (!value) {
      setQueries({ ...queries, character: null })
      updateConditionAction({ characterId: null })
      return
    }
    const currentCharacter = getCharacterData(queries.collection, value)
    setQueries({ ...queries, character: currentCharacter })
    updateConditionAction({ characterId: Number(value) })
  }

  const handleUpdateExpected = (value: string | null) => {
    setQueries({ ...queries, expected: Number(value) })
    updateConditionAction({ expected: Number(value) })
  }

  return (
    <>
      <BlockNew padding="24px 0 0 0">
        <Group>
          <GroupItem
            text="Collection"
            after={
              <Select
                options={[ANY_OPTION, ...collectionOptions]}
                value={queries.collection?.id?.toString() || ANY_OPTION.value}
                onChange={(value) => {
                  handleUpdateCollection(value)
                }}
              />
            }
          />
          {queries.collection && (
            <GroupItem
              text={queries.collection.title}
              before={
                <Image
                  src={queries.collection.logoUrl}
                  size={40}
                  borderRadius={50}
                />
              }
            />
          )}
        </Group>
      </BlockNew>
      <BlockNew padding="24px 0 0 0">
        <Group>
          <GroupItem
            text="Character"
            disabled={!queries.collection}
            after={
              <Select
                options={[ANY_OPTION, ...characterOptions]}
                value={queries.character?.id?.toString() || ANY_OPTION.value}
                onChange={(value) => {
                  handleUpdateCharacter(value)
                }}
              />
            }
          />
          {queries.character && (
            <GroupItem
              text={queries.character.name}
              before={
                <Image
                  src={queries.character.logoUrl}
                  size={40}
                  borderRadius={50}
                />
              }
            />
          )}
        </Group>
      </BlockNew>
      <BlockNew padding="24px 0 0 0">
        <GroupItem
          text="# of Stickers"
          after={
            <GroupInput
              placeholder="0"
              value={queries.expected?.toString() || ''}
              onChange={(value) => {
                handleUpdateExpected(value)
              }}
            />
          }
        />
      </BlockNew>
    </>
  )
}
