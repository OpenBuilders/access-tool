import {
  BlockNew,
  ConditionResolver,
  PageLayoutNew,
  TelegramBackButton,
  TelegramMainButton,
  Text,
} from '@components'
import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import {
  CONDITION_INITIAL_STATE,
  useAdminCreateConditionMutation,
  useCondition,
  useConditionActions,
  useIsSaved,
} from '@store-new'

export const AdminNewConditionPage = () => {
  const params = useParams<{ chatSlug: string }>()
  const chatSlug = params.chatSlug || ''

  const location = useLocation()
  const groupId = location.state?.groupId || null

  const condition = useCondition()
  const isSaved = useIsSaved()

  const { updateConditionAction } = useConditionActions()

  const {
    mutateAsync: createConditionMutateAsync,
    isPending: createConditionIsPending,
  } = useAdminCreateConditionMutation(chatSlug)

  const navigate = useNavigate()

  const handleMainButtonClick = async () => {
    if (!condition || isSaved) {
      return
    }

    await createConditionMutateAsync({
      type: condition.type,
      data: condition,
      chatSlug,
    })
    navigate(`/admin/chat/${chatSlug}`)
    updateConditionAction(CONDITION_INITIAL_STATE)
  }

  const handleBackButtonClick = () => {
    console.log('navigate to chat', chatSlug)
    navigate(`/admin/chat/${chatSlug}`)
  }

  useEffect(() => {
    if (!groupId) return
    updateConditionAction({ groupId })
  }, [groupId])

  return (
    <PageLayoutNew safeContent>
      <TelegramBackButton onClick={handleBackButtonClick} />
      <TelegramMainButton
        text="Create"
        onClick={handleMainButtonClick}
        disabled={createConditionIsPending}
        loading={createConditionIsPending}
      />
      <BlockNew padding="24px 0 0 0">
        <Text type="title" weight="bold" align="center">
          Create Condition
        </Text>
      </BlockNew>
      <ConditionResolver isNew />
    </PageLayoutNew>
  )
}
