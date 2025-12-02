import { BlockNew, Group, GroupInput, GroupItem, Text } from '@components'
import { goTo } from '@utils'
import { useState } from 'react'

import { useCondition, useConditionActions } from '@store-new'

import { ConditionResolverProps } from '../../types'
import { EmojiSkeleton } from './Emoji.skeleton'

export const Emoji = (props: ConditionResolverProps) => {
  const { conditionIsLoading } = props

  const condition = useCondition()
  const { updateConditionAction } = useConditionActions()

  const [queries, setQueries] = useState({
    emojiId: condition?.emojiId || null,
  })

  const handleUpdateEmojiId = (value: string | null) => {
    setQueries({ ...queries, emojiId: value })
    updateConditionAction({ emojiId: value })
  }

  if (conditionIsLoading) {
    return <EmojiSkeleton />
  }

  return (
    <BlockNew padding="24px 0 0 0">
      <Group
        footer={
          <Text type="caption" color="secondary">
            Use the{' '}
            <Text
              type="caption"
              color="accent"
              as="span"
              onClick={() => goTo('https://t.me/GetEmojiIdBot')}
            >
              @GetEmojiIdBot
            </Text>{' '}
            to get your emoji ID — this is a third-party service, and we’re not
            responsible for its availability or accuracy
          </Text>
        }
      >
        <GroupItem
          text="Emoji ID"
          after={
            <GroupInput
              placeholder="Value"
              pattern="[0-9]*"
              type="number"
              numeric
              value={queries.emojiId || ''}
              onChange={(value) => handleUpdateEmojiId(value)}
            />
          }
        />
      </Group>
    </BlockNew>
  )
}
