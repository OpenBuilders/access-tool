import { Chat, ChatInstance, ConditionType } from '@types'

import { ApiService, ApiServiceResponse } from '@services'

export const fetchAdminChatsAPI = async (): Promise<
  ApiServiceResponse<Chat[]>
> => {
  const response = await ApiService.get<Chat[]>({
    endpoint: '/admin/chats',
  })

  return response
}

export const fetchAdminChatAPI = async (
  slug: string
): Promise<ApiServiceResponse<ChatInstance>> => {
  const response = await ApiService.get<ChatInstance>({
    endpoint: `/admin/chats/${slug}`,
  })

  return response
}

export const updateAdminChatAPI = async (
  slug: string,
  data: Pick<Chat, 'description'>
): Promise<ApiServiceResponse<Chat>> => {
  const response = await ApiService.put<Chat>({
    endpoint: `/admin/chats/${slug}`,
    data,
  })

  return response
}

export const moveAdminChatConditionAPI = async ({
  ruleId,
  groupId,
  type,
  order,
  chatSlug,
}: {
  ruleId: number
  groupId: number
  type: ConditionType
  order: number
  chatSlug: string
}): Promise<{ status: string; message: string }> => {
  const response = await ApiService.put<{ status: string; message: string }>({
    endpoint: `/admin/chats/${chatSlug}/rules/move`,
    data: {
      ruleId,
      groupId,
      type,
      order,
    },
  })

  return response.data || { status: '', message: '' }
}

export const updateAdminChatVisibilityAPI = async (
  slug: string,
  data: Pick<Chat, 'isEnabled'>
): Promise<ApiServiceResponse<Chat>> => {
  const response = await ApiService.put<Chat>({
    endpoint: `/admin/chats/${slug}/visibility`,
    data,
  })

  return response
}
