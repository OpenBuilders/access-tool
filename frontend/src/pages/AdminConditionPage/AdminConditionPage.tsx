import {
  BlockNew,
  ConditionResolver,
  DialogModal,
  GroupItem,
  Icon,
  PageLayoutNew,
  TelegramBackButton,
  TelegramMainButton,
  Text,
  useToast,
} from '@components'
import { ConditionType } from '@types'
import { hapticFeedback } from '@utils'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  useAdminConditionQuery,
  useAdminDeleteConditionMutation,
  useAdminUpdateConditionMutation,
  useCondition,
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
  const { showToast } = useToast()

  const isSaved = useIsSaved()
  const condition = useCondition()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { isPending: conditionIsPending } = useAdminConditionQuery({
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

  const handleUpdateCondition = async () => {
    if (!condition) {
      return
    }

    hapticFeedback('soft')

    if (isSaved) {
      showToast({
        message: 'Condition is already saved',
        type: 'warning',
      })
      return
    }

    await updateConditionMutateAsync({
      conditionId,
      chatSlug,
      type: condition.type,
      data: condition,
    })

    showToast({
      message: 'Condition updated successfully',
      type: 'success',
    })

    navigate(`/admin/chat/${chatSlug}`)
  }

  const handleBackButtonClick = () => {
    if (!condition) return

    if (!isSaved) {
      console.log('modal: not saved')
      return
    }

    navigate(`/admin/chat/${chatSlug}`)
  }

  const handleDeleteButtonClick = () => {
    if (!condition) {
      return
    }
    hapticFeedback('soft')
    setIsDialogOpen(true)
  }

  const handleDeleteCondition = async () => {
    if (!condition || deleteConditionIsPending) {
      return
    }
    hapticFeedback('soft')
    await deleteConditionMutateAsync({
      conditionId,
      chatSlug,
      type: condition.type,
    })
    setIsDialogOpen(false)
    navigate(`/admin/chat/${chatSlug}`)
  }

  const handleCloseDialog = () => {
    if (!condition || deleteConditionIsPending) {
      return
    }
    hapticFeedback('soft')
    setIsDialogOpen(false)
  }

  return (
    <PageLayoutNew safeContent>
      <TelegramBackButton onClick={handleBackButtonClick} />
      <TelegramMainButton
        text="Save"
        onClick={handleUpdateCondition}
        disabled={updateConditionIsPending || isSaved}
        loading={updateConditionIsPending}
      />
      <BlockNew padding="24px 0 0 0">
        <Text type="title" weight="bold" align="center">
          Edit Condition
        </Text>
      </BlockNew>
      {conditionIsPending || !condition?.type ? null : <ConditionResolver />}
      <BlockNew padding="24px 0 0 0">
        <GroupItem
          onClick={handleDeleteButtonClick}
          text={
            <Text type="text" color="danger">
              Remove Condition
            </Text>
          }
          before={<Icon color="danger" name="trash" size={24} />}
        />
      </BlockNew>
      <DialogModal
        active={isDialogOpen}
        title="Remove Condition?"
        description="Removing this condition will delete all created dependencies. Are you sure you want to remove?"
        confirmText="Remove"
        closeText="Cancel"
        onClose={handleCloseDialog}
        onDelete={handleDeleteCondition}
      />
    </PageLayoutNew>
  )
}
