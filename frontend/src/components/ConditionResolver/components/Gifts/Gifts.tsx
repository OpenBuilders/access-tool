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

export const Gifts = () => {
  const condition = useCondition()
  const { updateConditionAction } = useConditionActions()

  const [queries, setQueries] = useState({
    collectionSlug: condition?.collectionSlug || null,
    model: condition?.model || null,
    backdrop: condition?.backdrop || null,
    pattern: condition?.pattern || null,
    expected: condition?.expected || '',
  })

  const { data: giftsData, isLoading: giftsIsLoading } =
    useAdminConditionPrefetchGiftsQuery()

  useEffect(() => {
    if (giftsData?.collections?.length) {
      const initialCollection = giftsData?.collections[0]
      setQueries({
        ...queries,
        collectionSlug: initialCollection?.slug || null,
      })
    }
  }, [giftsData?.collections?.length])

  if (giftsIsLoading) {
    return <p>Loading gifts...</p>
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

  //   const handleUpdateNFTCollectionCategory = (value: string | null) => {
  //     setQueries({ ...queries, category: value })
  //     updateConditionAction({ category: value })
  //   }

  //   const handleUpdateAddress = (value: string | null) => {
  //     setQueries({ ...queries, address: value })
  //     updateConditionAction({ address: value })
  //   }

  //   const handleUpdateExpected = (value: string | null) => {
  //     setQueries({ ...queries, expected: Number(value) })
  //     updateConditionAction({ expected: Number(value) })
  //   }

  // return (
  //   <>
  //     <BlockNew padding="24px 0 0 0">
  //       <Group>
  //         <GroupItem
  //           text="Collection"
  //           after={
  //             <Select
  //               options={[ANY_OPTION, ...nftCollectionOptions]}
  //               value={queries.asset || ANY_OPTION.value}
  //               onChange={(value) => handleUpdateNFTCollection(value)}
  //             />
  //           }
  //         />
  //       </Group>
  //     </BlockNew>
  //     <BlockNew padding="24px 0 0 0">
  //       {queries.asset ? (
  //         <Group>
  //           <GroupItem
  //             text="Character"
  //             after={
  //               <Select
  //                 options={[ANY_OPTION, ...nftCategoryOptions]}
  //                 value={queries.category || ANY_OPTION.value}
  //                 onChange={(value) => handleUpdateNFTCollectionCategory(value)}
  //               />
  //             }
  //           />
  //         </Group>
  //       ) : (
  //         <Group footer="TON (The Open Network)">
  //           <GroupItem
  //             disabled={prefetchIsLoading}
  //             main={
  //               <GroupInput
  //                 placeholder="NFT Collection Address"
  //                 value={queries.address || ''}
  //                 onChange={(value) => handleUpdateAddress(value)}
  //               />
  //             }
  //             after={prefetchIsLoading ? <Spinner size={16} /> : null}
  //           />
  //           {prefetchData && (
  //             <GroupItem
  //               before={
  //                 <Image
  //                   src={prefetchData.logoPath}
  //                   size={40}
  //                   borderRadius={50}
  //                 />
  //               }
  //               text={prefetchData.name}
  //             />
  //           )}
  //         </Group>
  //       )}
  //     </BlockNew>
  //     <BlockNew padding="24px 0 0 0">
  //       <GroupItem
  //         text="# of NFTs"
  //         after={
  //           <GroupInput
  //             placeholder="0"
  //             value={queries.expected?.toString() || ''}
  //             onChange={(value) => handleUpdateExpected(value)}
  //           />
  //         }
  //       />
  //     </BlockNew>
  //   </>
  // )
}
