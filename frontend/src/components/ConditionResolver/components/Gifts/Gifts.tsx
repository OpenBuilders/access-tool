import {
  BlockNew,
  Group,
  GroupInput,
  GroupItem,
  Image,
  Select,
} from '@components'
import { useEffect, useState } from 'react'

import {
  useAdminConditionPrefetchGiftsQuery,
  useCondition,
  useConditionActions,
} from '@store-new'

import { ANY_OPTION } from '../../constants'
import { ConditionResolverProps } from '../../types'
import { GiftsSkeleton } from './Gifts.skeleton'
import {
  getBackdropData,
  getCollectionData,
  getModelData,
  getPatternData,
} from './helpers'

export const Gifts = (props: ConditionResolverProps) => {
  const { conditionIsLoading } = props

  const condition = useCondition()
  const { updateConditionAction } = useConditionActions()

  const [queries, setQueries] = useState({
    collectionSlug: null as string | null,
    model: null as string | null,
    backdrop: null as string | null,
    pattern: null as string | null,
    expected: condition?.expected || '',
  })

  const { data: giftsData, isLoading: giftsIsLoading } =
    useAdminConditionPrefetchGiftsQuery()

  useEffect(() => {
    if (giftsData?.collections?.length) {
      const currentCollection = getCollectionData(
        giftsData,
        condition?.collectionSlug || ''
      )

      const currentModel = getModelData(
        currentCollection,
        condition?.model || ''
      )

      const currentBackdrop = getBackdropData(
        currentCollection,
        condition?.backdrop || ''
      )
      const currentPattern = getPatternData(
        currentCollection,
        condition?.pattern || ''
      )

      setQueries({
        ...queries,
        collectionSlug: currentCollection?.slug || null,
        model: currentModel || null,
        backdrop: currentBackdrop || null,
        pattern: currentPattern || null,
      })
    }
  }, [giftsData?.collections?.length])

  if (conditionIsLoading || giftsIsLoading) {
    return <GiftsSkeleton />
  }

  const collectionOptions =
    giftsData?.collections?.map((collection) => ({
      value: collection.slug,
      label: collection.title,
    })) || []

  const modelOptions =
    giftsData?.collections
      ?.find((collection) => collection.slug === queries.collectionSlug)
      ?.models?.map((model) => ({
        value: model,
        label: model,
      })) || []

  const backdropOptions =
    giftsData?.collections
      ?.find((collection) => collection.slug === queries.collectionSlug)
      ?.backdrops?.map((backdrop) => ({
        value: backdrop,
        label: backdrop,
      })) || []

  const patternOptions =
    giftsData?.collections
      ?.find((collection) => collection.slug === queries.collectionSlug)
      ?.patterns?.map((pattern) => ({
        value: pattern,
        label: pattern,
      })) || []

  const handleUpdateCollection = (value: string | null) => {
    setQueries({
      ...queries,
      collectionSlug: value,
      model: null,
      backdrop: null,
      pattern: null,
    })
    updateConditionAction({
      collectionSlug: value,
      model: null,
      backdrop: null,
      pattern: null,
    })
  }

  const handleUpdateAttribute = (
    field: 'model' | 'backdrop' | 'pattern',
    value: string | null
  ) => {
    setQueries({ ...queries, [field]: value })
    updateConditionAction({ [field]: value })
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
                value={queries.collectionSlug || ANY_OPTION.value}
                onChange={(value) => handleUpdateCollection(value)}
              />
            }
          />
          {queries.collectionSlug && (
            <GroupItem
              text={
                giftsData?.collections?.find(
                  (collection) => collection.slug === queries.collectionSlug
                )?.title
              }
              before={
                <Image
                  src={
                    giftsData?.collections?.find(
                      (collection) => collection.slug === queries.collectionSlug
                    )?.previewUrl
                  }
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
            text="Model"
            after={
              <Select
                options={[ANY_OPTION, ...modelOptions]}
                value={queries.model || ANY_OPTION.value}
                onChange={(value) => handleUpdateAttribute('model', value)}
              />
            }
          />
          <GroupItem
            text="Backdrop"
            after={
              <Select
                options={[ANY_OPTION, ...backdropOptions]}
                value={queries.backdrop || ANY_OPTION.value}
                onChange={(value) => handleUpdateAttribute('backdrop', value)}
              />
            }
          />
          <GroupItem
            text="Pattern"
            after={
              <Select
                options={[ANY_OPTION, ...patternOptions]}
                value={queries.pattern || ANY_OPTION.value}
                onChange={(value) => handleUpdateAttribute('pattern', value)}
              />
            }
          />
        </Group>
      </BlockNew>
      <BlockNew padding="24px 0 0 0">
        <GroupItem
          text="# of Gifts"
          after={
            <GroupInput
              placeholder="0"
              value={queries.expected?.toString() || ''}
              onChange={(value) => handleUpdateExpected(value)}
            />
          }
        />
      </BlockNew>
    </>
  )
}
