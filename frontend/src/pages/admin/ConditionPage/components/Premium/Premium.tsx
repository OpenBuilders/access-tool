import { Block, List, ListItem, ListToggler } from '@components'
import { useEffect } from 'react'

import { ConditionComponentProps } from '../types'

export const Premium = ({
  isNewCondition,
  handleChangeCondition,
  toggleIsValid,
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

  useEffect(() => {
    const validationResult = !!conditionState?.isEnabled
    toggleIsValid(validationResult)
  }, [conditionState])

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
  // const { condition } = useCondition()
  // const { setIsValidAction, handleChangeConditionFieldAction } =
  //   useConditionActions()

  // useEffect(() => {
  //   setIsValidAction(true)
  //   return () => {
  //     setIsValidAction(false)
  //   }
  // }, [])

  // const handleChange = (value: boolean) => {
  //   handleChangeConditionFieldAction('isEnabled', value)
  // }

  // return (
  // <>
  //   <Block margin="top" marginValue={24}>
  //     <List footer="We check for Telegram Premium only at the moment of joining the chat or channel">
  //       <ListItem
  //         paddingY={6}
  //         text="Request Telegram Premium"
  //         after={
  //           <ListToggler
  //             isEnabled={!!condition?.isEnabled}
  //             onChange={handleChange}
  //           />
  //         }
  //       />
  //     </List>
  //   </Block>
  // </>
  // )
}
