import { ApiService, ApiServiceResponse } from '@services'

import { ConditionType } from '../condition/types'
import { AdminChat, Chat, ChatInstance } from './types'

export const fetchChatAPI = async (
  slug: string
): Promise<ApiServiceResponse<Chat>> => {
  const response = await ApiService.get<Chat>({
    endpoint: `/admin/chats/${slug}`,
  })

  return response
}

export const updateChatAPI = async (
  slug: string,
  data: Partial<ChatInstance>
): Promise<ApiServiceResponse<ChatInstance>> => {
  const response = await ApiService.put<ChatInstance>({
    endpoint: `/admin/chats/${slug}`,
    data,
  })

  return response
}

export const fetchAdminUserChatsAPI = async (): Promise<
  ApiServiceResponse<AdminChat[]>
> => {
  const response = await ApiService.get<AdminChat[]>({
    endpoint: '/admin/chats',
  })

  return response
}

export const fetchUserChatAPI = async (
  slug: string
): Promise<ApiServiceResponse<Chat>> => {
  const response = await ApiService.get<Chat>({
    endpoint: `/chats/${slug}`,
  })

  return response
}

export const updateChatVisibilityAPI = async (
  slug: string,
  data: Partial<ChatInstance>
): Promise<ApiServiceResponse<ChatInstance>> => {
  const response = await ApiService.put<ChatInstance>({
    endpoint: `/admin/chats/${slug}/visibility`,
    data,
  })

  return response
}

export const updateChatFullControlAPI = async (
  slug: string,
  data: {
    isEnabled: boolean
    effectiveInDays: number
  }
): Promise<ApiServiceResponse<ChatInstance>> => {
  return await ApiService.put<ChatInstance>({
    endpoint: `/admin/chats/${slug}/control`,
    data,
  })
}

export const moveChatConditionApi = async ({
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
