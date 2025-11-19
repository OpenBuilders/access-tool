import { BlockNew, Group, GroupItem, Select } from '@components'

import { useAdminConditionStickersQuery, useCondition } from '@store-new'

export const Stickers = () => {
  const condition = useCondition()

  const { data: stickers, isPending: stickersIsPending } =
    useAdminConditionStickersQuery()

  if (stickersIsPending) {
    return <p>Loading stickers...</p>
  }

  const collectionOptions = [
    { value: undefined, label: 'Any' },
    ...(stickers?.map((sticker) => ({
      value: sticker.id.toString(),
      label: sticker.title,
    })) || []),
  ]

  //   const characterOptions = stickers?.flatMap((sticker) =>
  //     sticker.characters.map((character) => ({
  //       value: character.id.toString(),
  //       name: character.name,
  //     }))
  //   )

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
                  console.log(value)
                }}
              />
            }
          />
        </Group>
      </BlockNew>
      <BlockNew padding="24px 0 0 0">
        {/* <Group>
          <GroupItem text="Character" after={<Select />} />
        </Group> */}
      </BlockNew>
    </>
  )
}
