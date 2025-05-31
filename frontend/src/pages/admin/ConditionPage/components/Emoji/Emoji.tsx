import { Block, List, ListInput, ListItem } from '@components'
import { useEffect } from 'react'

import { Condition } from '@store'

import { ConditionComponentProps } from '../types'
import { Skeleton } from './Skeleton'

export const Emoji = ({
  isNewCondition,
  handleChangeCondition,
  conditionState,
  setInitialState,
  condition,
}: ConditionComponentProps) => {
  useEffect(() => {
    const updatedConditionState: Partial<Condition> = {
      type: 'emoji',
      isEnabled: condition?.isEnabled || true,
      emojiId: condition?.emojiId || '',
    }

    setInitialState(updatedConditionState as Partial<Condition>)
  }, [condition, isNewCondition])

  if (!conditionState?.type) {
    return <Skeleton />
  }

  return (
    <Block margin="top" marginValue={24}>
      <List>
        <ListItem
          text="Emoji ID"
          after={
            <ListInput
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              textColor="tertiary"
              value={conditionState?.emojiId}
              onChange={(value) => {
                const formatedNumberValue = value.replace(/[^\d]/g, '')
                handleChangeCondition('emojiId', formatedNumberValue)
              }}
            />
          }
        />
      </List>
    </Block>
  )
}
