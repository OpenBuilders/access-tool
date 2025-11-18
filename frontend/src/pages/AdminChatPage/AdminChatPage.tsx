import {
  BlockNew,
  GroupItem,
  Icon,
  PageLayoutNew,
  Spinner,
  TelegramBackButton,
  TelegramMainButton,
  Text,
} from '@components'
import { ChatHeader } from '@components'
import { useNavigate, useParams } from 'react-router-dom'

import config from '@config'
import { useAdminChatQuery, useAdminChatVisibilityMutation } from '@store-new'

import { AdminChatConditions, AdminChatDescription } from './components'

export const AdminChatPage = () => {
  const navigate = useNavigate()

  const params = useParams<{ chatSlug: string }>()
  const chatSlug = params.chatSlug || ''

  const { data: chatData, isPending: chatIsPending } =
    useAdminChatQuery(chatSlug)

  const {
    mutateAsync: updateAdminChatVisibilityMutateAsync,
    isPending: updateAdminChatVisibilityIsPending,
  } = useAdminChatVisibilityMutation(chatSlug)

  if (chatIsPending) {
    return <p>is loading....</p>
  }

  const handleOpenGroupChat = () => {
    navigate(`/chat/${chatData?.chat.slug}`)
  }

  const handleUpdateChatVisibility = async () => {
    if (!chatData?.chat) return
    await updateAdminChatVisibilityMutateAsync({
      isEnabled: !chatData?.chat.isEnabled,
    })
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
      <BlockNew padding="24px 0 0 0">
        <GroupItem
          disabled={updateAdminChatVisibilityIsPending}
          onClick={handleUpdateChatVisibility}
          text={
            <Text
              type="text"
              color={chatData?.chat.isEnabled ? 'danger' : 'accent'}
            >
              {chatData?.chat?.isEnabled
                ? `Pause Access for New Users`
                : 'Allow Access for New Users'}
            </Text>
          }
          after={updateAdminChatVisibilityIsPending && <Spinner size={16} />}
          before={
            <Icon
              name={chatData?.chat?.isEnabled ? 'eyeCrossed' : 'eye'}
              size={28}
              color={chatData?.chat?.isEnabled ? 'danger' : 'accent'}
            />
          }
        />
      </BlockNew>
      <BlockNew margin="24px 0 0 0">
        <Text type="caption" align="center" color="secondary">
          To delete access page to {chatData?.chat?.title},
          <br />
          remove @{config.botName} from admins
        </Text>
      </BlockNew>
    </PageLayoutNew>
  )
}
