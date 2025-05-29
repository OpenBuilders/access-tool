import {
  AppSelect,
  Block,
  Image,
  List,
  ListInput,
  ListItem,
  Text,
} from '@components'
import { useEffect, useState } from 'react'

import {
  useCondition,
  useConditionActions,
  Condition,
  StickersCollection,
  StickersCharacter,
} from '@store'

import { ConditionComponentProps } from '../types'
import { Skeleton } from './Skeleton'
import { getCharacterData, getCollectionData } from './helpers'

export const Stickers = ({
  isNewCondition,
  handleChangeCondition,
  conditionState,
  setInitialState,
  condition,
}: ConditionComponentProps) => {
  const { resetPrefetchedConditionDataAction, fetchStickersAction } =
    useConditionActions()
  const { stickersData } = useCondition()

  const [currentCollection, setCurrentCollection] =
    useState<StickersCollection | null>(null)

  const [currentCharacter, setCurrentCharacter] =
    useState<StickersCharacter | null>(null)

  const fetchStickers = async () => {
    try {
      await fetchStickersAction()
    } catch (error) {
      console.error(error)
      resetPrefetchedConditionDataAction()
    }
  }

  useEffect(() => {
    fetchStickers()
  }, [])

  useEffect(() => {
    if (stickersData?.length) {
      const updatedConditionState: Partial<Condition> = {
        type: 'sticker_collection',
        category: null,
        isEnabled: !!condition?.isEnabled || true,
        collectionId: condition?.collection?.id || stickersData[0].id,
        characterId:
          condition?.character?.id || stickersData[0].characters[0].id,
        expected: condition?.expected || '',
      }

      const collection = getCollectionData(
        stickersData,
        updatedConditionState.collectionId || ''
      )
      const character = getCharacterData(
        stickersData,
        updatedConditionState.collectionId || '',
        updatedConditionState.characterId || ''
      )

      setCurrentCollection(collection)
      setCurrentCharacter(character)

      setInitialState(updatedConditionState as Partial<Condition>)
    }
  }, [stickersData?.length, condition, isNewCondition])

  if (!stickersData?.length || !conditionState?.type) {
    return <Skeleton />
  }

  return (
    <>
      <Block margin="top" marginValue={24} fadeIn>
        <List>
          <ListItem
            text="Collection"
            after={
              <AppSelect
                onChange={(value) => {
                  const collection = getCollectionData(stickersData, value)
                  setCurrentCollection(collection)
                  setCurrentCharacter(collection?.characters[0] || null)
                  handleChangeCondition('collectionId', value)
                  handleChangeCondition(
                    'characterId',
                    collection?.characters[0]?.id || null
                  )
                }}
                value={conditionState?.collectionId?.toString()}
                options={stickersData.map((collection) => ({
                  value: collection.id.toString(),
                  name: collection.title,
                }))}
              />
            }
          />
          {currentCollection && (
            <ListItem
              before={
                <Image
                  src={currentCollection.logoUrl}
                  size={40}
                  borderRadius={50}
                />
              }
              text={
                <Text type="text" weight="medium">
                  {currentCollection.title}
                </Text>
              }
            />
          )}
        </List>
      </Block>
      <Block margin="top" marginValue={24}>
        <List>
          <ListItem
            text="Pack"
            after={
              <AppSelect
                onChange={(value) => {
                  const character = getCharacterData(
                    stickersData,
                    conditionState?.collectionId || '',
                    value
                  )
                  setCurrentCharacter(character)
                  handleChangeCondition('characterId', value)
                }}
                value={conditionState?.characterId?.toString()}
                options={currentCollection?.characters?.map((character) => ({
                  value: character.id.toString(),
                  name: character.name,
                }))}
              />
            }
          />
          {currentCollection && (
            <ListItem
              before={
                <Image
                  src={currentCharacter?.logoUrl}
                  size={40}
                  borderRadius={50}
                />
              }
              text={
                <Text type="text" weight="medium">
                  {currentCharacter?.name}
                </Text>
              }
            />
          )}
        </List>
      </Block>
      <Block margin="top" marginValue={24}>
        <ListItem
          text="# of Packs"
          after={
            <ListInput
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              textColor="tertiary"
              value={conditionState?.expected}
              onChange={(value) => handleChangeCondition('expected', value)}
            />
          }
        />
      </Block>
    </>
  )
}
