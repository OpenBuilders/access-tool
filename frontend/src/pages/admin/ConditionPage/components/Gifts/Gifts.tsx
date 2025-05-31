import { AppSelect, Image, ListInput, ListItem, Text } from '@components'
import { List } from '@components'
import { Block } from '@components'
import { useEffect, useState } from 'react'

import { Condition, GiftsCollection } from '@store'
import { useCondition } from '@store'
import { useConditionActions } from '@store'

import { ConditionComponentProps } from '../types'
import { Skeleton } from './Skeleton'

export const Gifts = ({
  isNewCondition,
  handleChangeCondition,
  conditionState,
  setInitialState,
  condition,
}: ConditionComponentProps) => {
  const { resetPrefetchedConditionDataAction, fetchGiftsAction } =
    useConditionActions()
  const { giftsData } = useCondition()

  const [currentCollection, setCurrentCollection] =
    useState<GiftsCollection | null>(null)

  const fetchGifts = async () => {
    try {
      await fetchGiftsAction()
    } catch (error) {
      console.error(error)
      resetPrefetchedConditionDataAction()
    }
  }

  useEffect(() => {
    fetchGifts()
  }, [])

  useEffect(() => {
    if (giftsData?.length) {
      const updatedConditionState: Partial<Condition> = {
        type: 'gift_collection',
        category: null,
        isEnabled: !!condition?.isEnabled || true,
        collectionSlug:
          condition?.collectionSlug ||
          condition?.slug ||
          (condition?.collection as GiftsCollection)?.slug ||
          giftsData[0].slug,
        model: condition?.model || null,
        backdrop: condition?.backdrop || null,
        pattern: condition?.pattern || null,
        expected: condition?.expected || '',
      }

      setCurrentCollection(
        giftsData.find(
          (collection) =>
            collection.slug ===
            (condition?.collectionSlug ||
              condition?.slug ||
              (condition?.collection as GiftsCollection)?.slug)
        ) || giftsData[0]
      )

      setInitialState(updatedConditionState as Partial<Condition>)
    }
  }, [giftsData?.length, condition, isNewCondition])

  if (!giftsData?.length || !conditionState?.type) {
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
                  setCurrentCollection(
                    giftsData.find((collection) => collection.slug === value) ||
                      giftsData[0]
                  )
                  handleChangeCondition('model', null)
                  handleChangeCondition('backdrop', null)
                  handleChangeCondition('pattern', null)
                  handleChangeCondition('collectionSlug', value)
                }}
                value={conditionState?.collectionSlug}
                options={giftsData.map((collection) => ({
                  value: collection.slug,
                  name: collection.title,
                }))}
              />
            }
          />
          {currentCollection && (
            <ListItem
              before={
                <Image
                  src={currentCollection.previewUrl}
                  size={40}
                  borderRadius={50}
                />
              }
              text={
                <Text type="text" weight="medium">
                  {currentCollection.slug}
                </Text>
              }
            />
          )}
        </List>
      </Block>
      <Block margin="top" marginValue={24} fadeIn>
        <List>
          <ListItem
            text="Model"
            after={
              <AppSelect
                onChange={(value) => {
                  if (value === 'Any') {
                    handleChangeCondition('model', null)
                  } else {
                    handleChangeCondition('model', value)
                  }
                  handleChangeCondition('model', value)
                }}
                value={conditionState?.model}
                options={[
                  {
                    value: 'Any',
                    name: 'Any',
                  },
                  ...(currentCollection?.models || []).map((model) => ({
                    value: model,
                    name: model,
                  })),
                ]}
              />
            }
          />
          <ListItem
            text="Backdrop"
            after={
              <AppSelect
                onChange={(value) => {
                  if (value === 'Any') {
                    handleChangeCondition('backdrop', null)
                  } else {
                    handleChangeCondition('backdrop', value)
                  }
                }}
                value={conditionState?.backdrop}
                options={[
                  {
                    value: 'Any',
                    name: 'Any',
                  },
                  ...(currentCollection?.backdrops || []).map((backdrop) => ({
                    value: backdrop,
                    name: backdrop,
                  })),
                ]}
              />
            }
          />
          <ListItem
            text="Pattern"
            after={
              <AppSelect
                onChange={(value) => {
                  if (value === 'Any') {
                    handleChangeCondition('pattern', null)
                  } else {
                    handleChangeCondition('pattern', value)
                  }
                }}
                value={conditionState?.pattern}
                options={[
                  {
                    value: 'Any',
                    name: 'Any',
                  },
                  ...(currentCollection?.patterns || []).map((pattern) => ({
                    value: pattern,
                    name: pattern,
                  })),
                ]}
              />
            }
          />
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
