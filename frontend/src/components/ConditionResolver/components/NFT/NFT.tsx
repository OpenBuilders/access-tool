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
  useAdminConditionCategoriesQuery,
  useAdminConditionStickersQuery,
  useCondition,
  useConditionActions,
} from '@store-new'

import { ANY_OPTION } from '../../constants'
import { getAssetData, getCharacterData, getCollectionData } from './helpers'

export const NFT = () => {
  const condition = useCondition()
  const { updateConditionAction } = useConditionActions()

  const [queries, setQueries] = useState({
    category: condition?.category || null,
    asset: condition?.asset || null,
    expected: condition?.expected || '',
  })

  const { data: categoriesData, isPending: categoriesIsPending } =
    useAdminConditionCategoriesQuery(condition.type)

  useEffect(() => {
    const initialAsset = condition?.asset || categoriesData?.[0]?.asset || null
    const initialCategory =
      condition?.category || categoriesData?.[0]?.categories[0] || null

    setQueries({ ...queries, category: initialCategory, asset: initialAsset })
    updateConditionAction({ category: initialCategory, asset: initialAsset })
  }, [categoriesData?.length])

  if (categoriesIsPending) {
    return <p>Loading stickers...</p>
  }

  const nftCollectionOptions =
    categoriesData?.map((asset) => ({
      value: asset.asset,
      label: asset.asset,
    })) || []

  const nftCategoryOptions =
    categoriesData
      ?.find((asset) => asset.asset === queries.asset)
      ?.categories.filter((category) => !!category)
      .map((category) => ({
        value: category,
        label: category,
      })) || []

  const handleUpdateNFTCollection = (value: string | null) => {
    if (!value) {
      setQueries({ ...queries, asset: null, category: null })
      updateConditionAction({ asset: null, category: null })
      return
    }
    setQueries({ ...queries, asset: value, category: null })
    updateConditionAction({ asset: Number(value), category: null })
  }

  const handleUpdateNFTCollectionCategory = (value: string | null) => {
    if (!value) {
      setQueries({ ...queries, category: null })
      updateConditionAction({ category: null })
      return
    }
    setQueries({ ...queries, category: value })
    updateConditionAction({ category: value })
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
                options={[ANY_OPTION, ...nftCollectionOptions]}
                value={queries.asset || ANY_OPTION.value}
                onChange={(value) => handleUpdateNFTCollection(value)}
              />
            }
          />
        </Group>
      </BlockNew>
      <BlockNew padding="24px 0 0 0">
        <Group>
          <GroupItem
            text="Character"
            disabled={!queries.asset}
            after={
              <Select
                options={[ANY_OPTION, ...nftCategoryOptions]}
                value={queries.category || ANY_OPTION.value}
                onChange={(value) => handleUpdateNFTCollectionCategory(value)}
              />
            }
          />
        </Group>
      </BlockNew>
      <BlockNew padding="24px 0 0 0">
        <GroupItem
          text="# of NFTs"
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
