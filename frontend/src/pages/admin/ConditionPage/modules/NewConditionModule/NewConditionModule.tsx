import { AppSelect, Text, Block, ListItem } from '@components'
import { useAppNavigation } from '@hooks'
import { ROUTES_NAME } from '@routes'
import { useParams } from 'react-router-dom'

import { CONDITION_COMPONENTS, CONDITION_TYPES } from '../../constants'

export const NewConditionModule = () => {
  const { appNavigate } = useAppNavigation()
  const params = useParams<{
    chatSlug: string
    conditionType: string
  }>()

  const chatSlugParam = params.chatSlug || ''
  const conditionTypeParam = params.conditionType || ''

  const Component =
    CONDITION_COMPONENTS[
      conditionTypeParam as keyof typeof CONDITION_COMPONENTS
    ]

  const handleChangeType = (value: string) => {
    // resetPrefetchedConditionDataAction()
    appNavigate({
      path: ROUTES_NAME.CHAT_NEW_CONDITION,
      params: {
        conditionType: value,
        chatSlug: chatSlugParam,
      },
    })
  }

  return (
    <>
      <Block margin="top" marginValue={32}>
        <Text type="title" weight="bold" align="center">
          Add condition
        </Text>
      </Block>
      <Block margin="top" marginValue={44}>
        <ListItem
          text="Choose type"
          after={
            <AppSelect
              onChange={(value) => handleChangeType(value)}
              options={CONDITION_TYPES}
              value={conditionTypeParam}
            />
          }
        />
      </Block>
      {Component && <Component isNewCondition />}
    </>
  )
}
