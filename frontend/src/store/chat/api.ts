import { ApiService, ApiServiceResponse } from '@services'

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
