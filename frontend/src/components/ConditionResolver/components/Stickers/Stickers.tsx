import { BlockNew, Group, GroupItem, Select } from '@components'
import { Condition, Option } from '@types'
import { useState } from 'react'

import {
  useAdminConditionStickersQuery,
  useCondition,
  useConditionActions,
} from '@store-new'

export const Stickers = () => {
  const condition = useCondition()
  const { updateConditionAction } = useConditionActions()

  const { data: stickers, isPending: stickersIsPending } =
    useAdminConditionStickersQuery()

  if (stickersIsPending) {
    return <p>Loading stickers...</p>
  }
  console.log(condition)
  const handleChangeCollection = (field: keyof Condition, value?: string) => {
    // updateConditionAction({
    //   [field]: value,
    // })
  }

  const collectionOptions = [
    { value: undefined, label: 'Any' },
    ...(stickers?.map((sticker) => ({
      value: sticker.id.toString(),
      label: sticker.title,
      image: sticker.logoUrl,
    })) || []),
  ]

  return (
    <>
      <BlockNew padding="24px 0 0 0">
        <Group>
          <GroupItem
            text="Collection"
            after={
              <Select
                options={collectionOptions}
                value={condition?.collection?.id?.toString()}
                onChange={(value) => {
                  handleChangeCollection('collection', value)
                }}
              />
            }
          />
        </Group>
      </BlockNew>
      {/* <BlockNew padding="24px 0 0 0">
        <Group>
          <GroupItem
            text="Character"
            after={
              <Select
                options={characterOptions}
                value={condition?.character?.id?.toString()}
                onChange={(value) => {
                  console.log(value)
                }}
              />
            }
          />
        </Group>
      </BlockNew> */}
    </>
  )
}
