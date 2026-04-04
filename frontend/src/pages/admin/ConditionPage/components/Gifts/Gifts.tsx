import { AppSelect, Image, ListInput, ListItem, Text } from '@components';
import { List } from '@components';
import { Block } from '@components';
import { useEffect } from 'react';

import { Condition, GiftsCollection } from '@store';
import { useCondition } from '@store';
import { useConditionActions } from '@store';

import { ConditionComponentProps } from '../types';
import { Skeleton } from './Skeleton';

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
      const selectedCollectionId: string =
        condition?.collectionId != null
          ? String(condition.collectionId)
          : (condition?.collection as GiftsCollection)?.id != null
            ? String((condition?.collection as GiftsCollection).id)
            : giftsData[0].id

      const updatedConditionState: Partial<Condition> = {
        type: 'gift_collection',
        category: null,
        isEnabled: condition?.isEnabled ?? true,
        collectionId: selectedCollectionId,
        model: condition?.model ?? null,
        backdrop: condition?.backdrop ?? null,
        pattern: condition?.pattern ?? null,
        expected: condition?.expected ?? '',
      }
      setInitialState(updatedConditionState as Partial<Condition>)
    }
  }, [giftsData?.length, condition, isNewCondition])

  if (!giftsData?.length || !conditionState?.type) {
    return <Skeleton />
  }

  // derive currentCollection from the authoritative conditionState.collectionId
  const currentCollection: GiftsCollection =
    giftsData.find((collection) =>
      collection.id === String(conditionState?.collectionId ?? giftsData[0].id)
    ) || giftsData[0]

  return (
    <>
      <Block margin="top" marginValue={24} fadeIn>
        <List>
          <ListItem
            text="Collection"
            after={
              <AppSelect
                onChange={(value) => {
                  const selectedIdStr = String(value)

                  // reset dependent fields
                  handleChangeCondition('model', null)
                  handleChangeCondition('backdrop', null)
                  handleChangeCondition('pattern', null)

                  // store selected collection id in condition state
                  handleChangeCondition('collectionId', selectedIdStr)
                }}
                // the select value should reflect the selected collection id (string)
                value={String(
                  conditionState?.collectionId ?? currentCollection?.id ?? giftsData[0].id
                )}
                options={giftsData.map((collection) => ({
                  value: collection.id,
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
                  {currentCollection.title}
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
          text="# of Gifts"
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
