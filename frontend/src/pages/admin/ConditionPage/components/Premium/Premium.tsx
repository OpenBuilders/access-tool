import { Block, List, ListItem, ListToggler } from '@components'
import { useEffect } from 'react'

import { ConditionComponentProps } from '../types'

export const Premium = ({
  isNewCondition,
  handleChangeCondition,
  conditionState,
  setInitialState,
  condition,
}: ConditionComponentProps) => {
  useEffect(() => {
    if (isNewCondition || condition) {
      setInitialState({
        ...conditionState,
        type: 'premium',
        isEnabled: !!condition?.isEnabled,
      })
    }
  }, [condition])

  if (!conditionState?.type) return null

  return (
    <>
      <Block margin="top" marginValue={24}>
        <List footer="We check for Telegram Premium only at the moment of joining the chat or channel">
          <ListItem
            paddingY={6}
            text="Request Telegram Premium"
            after={
              <ListToggler
                isEnabled={!!conditionState?.isEnabled}
                onChange={(value) => handleChangeCondition('isEnabled', value)}
              />
            }
          />
        </List>
      </Block>
    </>
  )
}
