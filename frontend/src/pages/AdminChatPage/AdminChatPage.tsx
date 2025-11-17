import {
  BlockNew,
  PageLayoutNew,
  TelegramBackButton,
  TelegramMainButton,
} from '@components'
import { ChatHeader } from '@components'
import { useNavigate, useParams } from 'react-router-dom'

import { useAdminChatQuery } from '@store-new'

import styles from './AdminChatPage.module.scss'
import { AdminChatConditions, AdminChatDescription } from './components'

export const AdminChatPage = () => {
  const navigate = useNavigate()

  const params = useParams<{ chatSlug: string }>()
  const chatSlug = params.chatSlug || ''

  const { data: chatData, isPending: chatIsPending } =
    useAdminChatQuery(chatSlug)

  if (chatIsPending) {
    return <p>is loading....</p>
  }

  const handleOpenGroupChat = () => {
    navigate(`/chat/${chatData?.chat.slug}`)
  }

  return (
    <PageLayoutNew safeContent>
      <TelegramBackButton />
      <TelegramMainButton text="View Page" onClick={handleOpenGroupChat} />
      <ChatHeader chat={chatData?.chat} />
      <BlockNew padding="24px 0 0 0">
        <AdminChatDescription chat={chatData?.chat} />
      </BlockNew>
      <AdminChatConditions groups={chatData?.groups} />
    </PageLayoutNew>
  )
}
