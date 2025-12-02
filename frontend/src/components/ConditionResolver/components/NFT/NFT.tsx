import {
  BlockNew,
  Group,
  GroupInput,
  GroupItem,
  Image,
  Select,
  Spinner,
} from '@components'
import { useDebounce } from '@uidotdev/usehooks'
import { useEffect, useState } from 'react'

import {
  useAdminConditionCategoriesQuery,
  useAdminConditionPrefetchQuery,
  useCondition,
  useConditionActions,
} from '@store-new'

import { ANY_OPTION } from '../../constants'
import { NFTSkeleton } from './NFT.skeleton'

export const NFT = () => {
  const condition = useCondition()
  const { updateConditionAction } = useConditionActions()

  const [queries, setQueries] = useState({
    category: condition?.category || null,
    asset: condition?.asset || null,
    address: condition?.address || null,
    expected: condition?.expected || '',
  })

  const { data: categoriesData, isPending: categoriesIsPending } =
    useAdminConditionCategoriesQuery(condition.type)

  const debouncedJettonAddress = useDebounce(queries.address, 500)

  const { data: prefetchData, isLoading: prefetchIsLoading } =
    useAdminConditionPrefetchQuery(condition.type, debouncedJettonAddress || '')

  useEffect(() => {
    const initialAsset = condition?.asset || null
    const initialCategory = condition?.category || null

    setQueries({ ...queries, category: initialCategory, asset: initialAsset })
    updateConditionAction({ category: initialCategory, asset: initialAsset })
  }, [categoriesData?.length])

  if (categoriesIsPending) {
    return <NFTSkeleton />
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
    setQueries({ ...queries, asset: value, category: null, address: null })
    updateConditionAction({
      asset: value,
      category: null,
      address: null,
    })
  }

  const handleUpdateNFTCollectionCategory = (value: string | null) => {
    setQueries({ ...queries, category: value })
    updateConditionAction({ category: value })
  }

  const handleUpdateAddress = (value: string | null) => {
    setQueries({ ...queries, address: value })
    updateConditionAction({ address: value })
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
        {queries.asset ? (
          <Group>
            <GroupItem
              text="Character"
              after={
                <Select
                  options={[ANY_OPTION, ...nftCategoryOptions]}
                  value={queries.category || ANY_OPTION.value}
                  onChange={(value) => handleUpdateNFTCollectionCategory(value)}
                />
              }
            />
          </Group>
        ) : (
          <Group footer="TON (The Open Network)">
            <GroupItem
              disabled={prefetchIsLoading}
              main={
                <GroupInput
                  placeholder="NFT Collection Address"
                  value={queries.address || ''}
                  onChange={(value) => handleUpdateAddress(value)}
                />
              }
              after={prefetchIsLoading ? <Spinner size={16} /> : null}
            />
            {prefetchData && (
              <GroupItem
                before={
                  <Image
                    src={prefetchData.logoPath}
                    size={40}
                    borderRadius={50}
                  />
                }
                text={prefetchData.name}
              />
            )}
          </Group>
        )}
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
