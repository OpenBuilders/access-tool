import {
  BlockNew,
  ConditionResolver,
  PageLayoutNew,
  TelegramBackButton,
  TelegramMainButton,
  Text,
} from '@components'
import { ConditionType } from '@types'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useConditionActions } from '@store-new'

export const AdminNewConditionPage = () => {
  const params = useParams<{ chatSlug: string }>()
  const chatSlug = params.chatSlug || ''

  const { setConditionTypeAction } = useConditionActions()

  const navigate = useNavigate()

  const handleMainButtonClick = () => {
    console.log('create condition')
  }

  const handleBackButtonClick = () => {
    console.log('navigate to chat', chatSlug)
    navigate(`/admin/chat/${chatSlug}`)
  }

  useEffect(() => {
    setConditionTypeAction(ConditionType.JETTON)
  }, [])

  return (
    <PageLayoutNew safeContent>
      <TelegramBackButton onClick={handleBackButtonClick} />
      <TelegramMainButton text="Create" onClick={handleMainButtonClick} />
      <BlockNew padding="28px 0 0 0">
        <Text type="title" weight="bold" align="center">
          Create Condition
        </Text>
      </BlockNew>
      <ConditionResolver isNew />
    </PageLayoutNew>
  )
}
