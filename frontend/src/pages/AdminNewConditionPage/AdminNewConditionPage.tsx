import {
  BlockNew,
  ConditionResolver,
  PageLayoutNew,
  TelegramBackButton,
  TelegramMainButton,
  Text,
} from '@components'
import { useNavigate, useParams } from 'react-router-dom'

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
    navigate(`/admin/chat/${chatSlug}`)
  }

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
