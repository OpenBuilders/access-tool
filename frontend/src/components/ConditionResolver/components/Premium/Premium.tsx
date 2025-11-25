import { BlockNew, Group, GroupItem, Toggle } from '@components'
import { useState } from 'react'

import { useCondition, useConditionActions } from '@store-new'

export const Premium = () => {
  const condition = useCondition()
  const { updateConditionAction } = useConditionActions()

  const [queries, setQueries] = useState({
    isEnabled: !!condition?.isEnabled,
  })

  const handleUpdateIsEnabled = (value: boolean) => {
    setQueries({ ...queries, isEnabled: value })
    updateConditionAction({ isEnabled: value })
  }

  return (
    <BlockNew padding="24px 0 0 0">
      <Group footer="We check for Telegram Premium only at the moment of joining the chat or channel.">
        <GroupItem
          text="Request Telegram Premium"
          after={
            <Toggle
              isEnabled={queries.isEnabled}
              onChange={handleUpdateIsEnabled}
            />
          }
        />
      </Group>
    </BlockNew>
  )
}
