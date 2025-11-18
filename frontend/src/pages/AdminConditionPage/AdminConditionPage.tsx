import {
  BlockNew,
  ConditionResolver,
  PageLayoutNew,
  TelegramBackButton,
  TelegramMainButton,
  Text,
} from '@components'
import { ConditionType } from '@types'
import { useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  useAdminConditionQuery,
  useAdminDeleteConditionMutation,
  useAdminUpdateConditionMutation,
  useCondition,
  useConditionActions,
  useIsSaved,
} from '@store-new'

export const AdminConditionPage = () => {
  const params = useParams<{
    chatSlug: string
    conditionId: string
    conditionType: ConditionType
  }>()

  const conditionId = params.conditionId ?? ''
  const chatSlug = params.chatSlug ?? ''
  const conditionType = params.conditionType ?? ''

  const navigate = useNavigate()

  const isSaved = useIsSaved()
  const condition = useCondition()
  const { setInitialConditionAction } = useConditionActions()

  const { data: conditionData, isPending: conditionIsPending } =
    useAdminConditionQuery({
      conditionId,
      chatSlug,
      type: conditionType as ConditionType,
    })
  const {
    mutateAsync: deleteConditionMutateAsync,
    isPending: deleteConditionIsPending,
  } = useAdminDeleteConditionMutation(chatSlug)
  const {
    mutateAsync: updateConditionMutateAsync,
    isPending: updateConditionIsPending,
  } = useAdminUpdateConditionMutation(chatSlug)

  useEffect(() => {
    if (conditionData) {
      setInitialConditionAction(conditionData)
    }
  }, [conditionData])

  if (conditionIsPending || !condition) {
    return <div>Loading...</div>
  }

  const handleMainButtonClick = () => {
    if (!condition || isSaved) {
      return
    }
    updateConditionMutateAsync({
      conditionId,
      type: conditionType as ConditionType,
      data: condition,
    })
  }

  const handleBackButtonClick = () => {
    if (!condition) return

    if (!isSaved) {
      console.log('modal: not saved')
      return
    }

    navigate(`/admin/chat/${chatSlug}`)
  }

  return (
    <PageLayoutNew safeContent>
      <TelegramBackButton onClick={handleBackButtonClick} />
      <TelegramMainButton text="Save" onClick={handleMainButtonClick} />
      <BlockNew padding="28px 0 0 0">
        <Text type="title" weight="bold" align="center">
          Edit Condition
        </Text>
      </BlockNew>
      <ConditionResolver />
    </PageLayoutNew>
  )
}
